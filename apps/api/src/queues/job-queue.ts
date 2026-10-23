import { AsyncLocalStorage } from 'node:async_hooks';

type Producer = { send(body: unknown): Promise<void> };
type RequestContext = { waitUntil(promise: Promise<unknown>): void };

export const requestContext = new AsyncLocalStorage<RequestContext>();

export class JobQueue<Jobs> {
  constructor(
    private readonly name: string,
    private readonly producer: Producer,
  ) {}

  send<Name extends keyof Jobs & string>(job: Name, payload: Jobs[Name]): void {
    const ctx = requestContext.getStore();
    if (!ctx) throw new Error(`Queue "${this.name}" used outside a request`);
    ctx.waitUntil(
      this.producer.send({ name: job, payload }).catch((err: unknown) =>
        console.error(
          JSON.stringify({
            level: 'error',
            event: 'queue_send_failed',
            queue: this.name,
            job,
            error: err instanceof Error ? err.message : String(err),
          }),
        ),
      ),
    );
  }
}

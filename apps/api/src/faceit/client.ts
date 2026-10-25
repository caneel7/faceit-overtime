import type { Bindings } from '../env';
import { FaceitDataPlayer, type FaceitPlayer } from './schemas';

const DATA_API = 'https://open.faceit.com/data/v4';
const TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 500;

export class FaceitClient {
  constructor(private readonly apiKey: string) {}

  static fromEnv(env: Bindings): FaceitClient {
    return new FaceitClient(env.FACEIT_API_KEY);
  }

  async player(faceitPlayerId: string): Promise<FaceitPlayer | null> {
    const res = await this.get(`/players/${encodeURIComponent(faceitPlayerId)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`FACEIT Data API responded ${res.status}`);
    return FaceitDataPlayer.parse(await res.json());
  }

  private async get(path: string): Promise<Response> {
    const request = () =>
      fetch(`${DATA_API}${path}`, {
        headers: { authorization: `Bearer ${this.apiKey}`, accept: 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    const res = await request();
    if (res.status !== 429 && res.status < 500) return res;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return request();
  }
}

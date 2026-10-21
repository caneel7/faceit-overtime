import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBody, z } from '../src';
import { AppError, notFound, onError, respond, validator } from '../src/hono';

const Player = z.object({ nickname: z.string().min(3), level: z.number().int() });

function makeApp() {
  return new Hono<{ Bindings: { ENVIRONMENT: string } }>()
    .post('/players', validator('json', Player), (c) =>
      respond(c, Player, c.req.valid('json'), 201),
    )
    .get('/broken', (c) =>
      respond(c, Player, { nickname: 'ab', level: 1.5 } as unknown as z.input<typeof Player>),
    )
    .get('/conflict', () => {
      throw new AppError('CONFLICT', 409, 'Already registered', { teamId: 't1' });
    })
    .get('/crash', () => {
      throw new Error('boom');
    })
    .onError(onError)
    .notFound(notFound);
}

let consoleError: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  return () => consoleError.mockRestore();
});

const dev = { ENVIRONMENT: 'development' };
const prod = { ENVIRONMENT: 'production' };
const json = (body: unknown) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: typeof body === 'string' ? body : JSON.stringify(body),
});

describe('validator', () => {
  it('passes valid input through', async () => {
    const res = await makeApp().request('/players', json({ nickname: 's1mple', level: 10 }), dev);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ nickname: 's1mple', level: 10 });
  });

  it('rejects invalid input with VALIDATION_FAILED and the zod issues', async () => {
    const res = await makeApp().request('/players', json({ nickname: 'ab', level: 1.5 }), prod);
    expect(res.status).toBe(400);
    const body = ErrorBody.parse(await res.json());
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.details).toHaveLength(2);
  });

  it('rejects malformed JSON with VALIDATION_FAILED', async () => {
    const res = await makeApp().request('/players', json('{"nickname":'), dev);
    expect(res.status).toBe(400);
    expect(ErrorBody.parse(await res.json()).error.code).toBe('VALIDATION_FAILED');
  });
});

describe('respond', () => {
  it('turns a response that breaks its schema into 500 INTERNAL with details outside production', async () => {
    const res = await makeApp().request('/broken', {}, dev);
    expect(res.status).toBe(500);
    const body = ErrorBody.parse(await res.json());
    expect(body.error.code).toBe('INTERNAL');
    expect(body.error.details).toBeDefined();
    expect(consoleError).toHaveBeenCalledOnce();
  });

  it('hides the details in production', async () => {
    const res = await makeApp().request('/broken', {}, prod);
    expect(res.status).toBe(500);
    expect(ErrorBody.parse(await res.json()).error.details).toBeUndefined();
  });
});

describe('onError / notFound', () => {
  it('serializes AppError with its status, code and details', async () => {
    const res = await makeApp().request('/conflict', {}, prod);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: { code: 'CONFLICT', message: 'Already registered', details: { teamId: 't1' } },
    });
  });

  it('maps unknown errors to a generic 500', async () => {
    const res = await makeApp().request('/crash', {}, prod);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: { code: 'INTERNAL', message: 'Internal server error' },
    });
  });

  it('returns 404 NOT_FOUND for unknown routes', async () => {
    const res = await makeApp().request('/nope', {}, prod);
    expect(res.status).toBe(404);
    expect(ErrorBody.parse(await res.json()).error.code).toBe('NOT_FOUND');
  });
});

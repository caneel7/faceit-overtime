import { AppError } from '@overtime/shared/hono';
import type { Context } from 'hono';
import type { AppEnv, RateLimiter } from '../env';

export async function limit(c: Context<AppEnv>, limiter: RateLimiter, key: string): Promise<void> {
  const { success } = await limiter.limit({ key });
  if (!success) {
    c.header('Retry-After', '60');
    throw new AppError('RATE_LIMITED', 429, 'Too many attempts. Wait a minute, then try again.');
  }
}

export function clientIp(c: Context<AppEnv>): string | null {
  return c.req.header('cf-connecting-ip') ?? null;
}

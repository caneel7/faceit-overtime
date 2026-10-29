import { z } from 'zod';
import { Level, Region } from './common';

export const PlayerSummary = z.object({
  nickname: z.string(),
  avatarUrl: z.string().nullable(),
  country: z.string().nullable(),
  cs2Level: Level.nullable(),
  cs2Elo: z.number().int().nullable(),
  cs2Region: Region.nullable(),
});
export type PlayerSummary = z.infer<typeof PlayerSummary>;

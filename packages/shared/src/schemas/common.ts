import { z } from 'zod';

export const Id = z.uuid();

export const Slug = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9-]+$/);

export const IsoDateTime = z.iso.datetime();

export const REGIONS = ['EU', 'NA', 'SA', 'OCE', 'SEA'] as const;
export const Region = z.enum(REGIONS);
export type Region = z.infer<typeof Region>;

export const Level = z.number().int().min(1).max(10);

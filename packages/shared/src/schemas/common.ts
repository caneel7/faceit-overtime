import { z } from 'zod';

export const Id = z.uuid();

export const Slug = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9-]+$/);

export const IsoDateTime = z.iso.datetime();

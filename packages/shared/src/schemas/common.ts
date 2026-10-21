import { z } from 'zod';

export const Id = z.uuid();

// FR-ORG-1: 3–40 chars, lowercase letters, digits and hyphens
export const Slug = z
  .string()
  .min(3)
  .max(40)
  .regex(/^[a-z0-9-]+$/);

// Timestamps travel as ISO strings; z.date() would type the client as Date while JSON gives a string.
export const IsoDateTime = z.iso.datetime();

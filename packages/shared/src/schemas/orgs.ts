import { z } from 'zod';
import { Id } from './common';

export const OrgRole = z.enum(['owner', 'admin']);
export type OrgRole = z.infer<typeof OrgRole>;

export const OrgSummary = z.object({ id: Id, slug: z.string(), name: z.string() });
export type OrgSummary = z.infer<typeof OrgSummary>;

import { z } from '@overtime/shared';

export const CreateTeamFormValues = z.object({
  name: z.string().trim().min(1).max(32),
  tag: z.string().trim().min(1).max(5),
  role: z.enum(['player', 'coach']),
});
export type CreateTeamFormValues = z.infer<typeof CreateTeamFormValues>;

export const TEAM_FIELD_MESSAGES = {
  name: 'Use 1 to 32 characters.',
  tag: 'Use 1 to 5 characters.',
} as const;

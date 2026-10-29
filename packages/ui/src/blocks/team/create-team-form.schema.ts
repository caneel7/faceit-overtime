import { CreateTeamRequest } from '@overtime/shared';

export const CreateTeamFormValues = CreateTeamRequest;
export type CreateTeamFormValues = CreateTeamRequest;

export const TEAM_FIELD_MESSAGES = {
  name: 'Use 1 to 32 characters.',
  tag: 'Use 1 to 5 characters.',
} as const;

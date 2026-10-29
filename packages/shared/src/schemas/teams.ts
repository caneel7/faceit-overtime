import { z } from 'zod';
import { Id, IsoDateTime } from './common';
import { PlayerSummary } from './player';

export const TeamRole = z.enum(['player', 'coach']);
export type TeamRole = z.infer<typeof TeamRole>;

export const TEAM_MAX_PLAYERS = 6;
export const TEAM_MAX_COACHES = 1;

export const TeamName = z.string().trim().min(1).max(32);
export const TeamTag = z.string().trim().min(1).max(5);

export const TeamMember = z.object({
  userId: Id,
  displayName: z.string(),
  role: TeamRole,
  isCaptain: z.boolean(),
  player: PlayerSummary.nullable(),
  joinedAt: IsoDateTime,
});
export type TeamMember = z.infer<typeof TeamMember>;

export const TeamPendingInvite = z.object({
  inviteId: Id,
  displayName: z.string(),
  role: TeamRole,
  expiresAt: IsoDateTime,
});
export type TeamPendingInvite = z.infer<typeof TeamPendingInvite>;

export const TeamDetail = z.object({
  id: Id,
  name: z.string(),
  tag: z.string(),
  avgElo: z.number().int().nullable(),
  members: z.array(TeamMember),
  pendingInvites: z.array(TeamPendingInvite),
});
export type TeamDetail = z.infer<typeof TeamDetail>;

export const TeamSummary = z.object({
  id: Id,
  name: z.string(),
  tag: z.string(),
  myRole: TeamRole,
  isCaptain: z.boolean(),
  memberCount: z.number().int(),
  avgElo: z.number().int().nullable(),
});
export type TeamSummary = z.infer<typeof TeamSummary>;

export const InviteCandidate = z.object({
  userId: Id,
  displayName: z.string(),
  player: PlayerSummary.nullable(),
});
export type InviteCandidate = z.infer<typeof InviteCandidate>;

export const TeamParams = z.object({ id: Id });
export type TeamParams = z.infer<typeof TeamParams>;

export const TeamInviteParams = z.object({ id: Id, inviteId: Id });
export type TeamInviteParams = z.infer<typeof TeamInviteParams>;

export const TeamMemberParams = z.object({ id: Id, userId: Id });
export type TeamMemberParams = z.infer<typeof TeamMemberParams>;

export const CreateTeamRequest = z.object({ name: TeamName, tag: TeamTag, role: TeamRole });
export type CreateTeamRequest = z.infer<typeof CreateTeamRequest>;

export const TeamResponse = z.object({ team: TeamDetail });
export type TeamResponse = z.infer<typeof TeamResponse>;

export const MyTeamsResponse = z.object({ teams: z.array(TeamSummary) });
export type MyTeamsResponse = z.infer<typeof MyTeamsResponse>;

export const CandidatesQuery = z.object({ q: z.string().trim().min(2).max(254) });
export type CandidatesQuery = z.infer<typeof CandidatesQuery>;

export const CandidatesResponse = z.object({ candidates: z.array(InviteCandidate) });
export type CandidatesResponse = z.infer<typeof CandidatesResponse>;

export const InviteMemberRequest = z.object({ userId: Id, role: TeamRole });
export type InviteMemberRequest = z.infer<typeof InviteMemberRequest>;

export const InviteMemberResponse = z.object({ pendingInvite: TeamPendingInvite });
export type InviteMemberResponse = z.infer<typeof InviteMemberResponse>;

export const RevokeInviteResponse = z.object({ status: z.literal('revoked') });
export type RevokeInviteResponse = z.infer<typeof RevokeInviteResponse>;

export const RemoveMemberResponse = z.object({ status: z.literal('removed') });
export type RemoveMemberResponse = z.infer<typeof RemoveMemberResponse>;

export const LeaveTeamResponse = z.object({ status: z.literal('left') });
export type LeaveTeamResponse = z.infer<typeof LeaveTeamResponse>;

import type { PlayerSummary } from './player';

export const TEAM_MAX_PLAYERS = 6;
export const TEAM_MAX_COACHES = 1;

export type TeamRole = 'player' | 'coach';

export type TeamMember = {
  userId: string;
  displayName: string;
  role: TeamRole;
  isCaptain: boolean;
  player: PlayerSummary | null;
  joinedAt: string;
};

export type TeamPendingInvite = {
  inviteId: string;
  displayName: string;
  role: TeamRole;
  expiresAt: string;
};

export type TeamDetail = {
  id: string;
  name: string;
  tag: string;
  avgElo: number | null;
  members: TeamMember[];
  pendingInvites: TeamPendingInvite[];
};

export type TeamSummary = {
  id: string;
  name: string;
  tag: string;
  myRole: TeamRole;
  isCaptain: boolean;
  memberCount: number;
};

export type InviteCandidate = {
  userId: string;
  displayName: string;
  player: PlayerSummary | null;
};

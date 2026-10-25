import type { OrgSummary } from './org';
import type { TeamRole } from './team';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';

export type TeamInvite = {
  kind: 'team';
  id: string;
  team: { id: string; name: string; tag: string };
  role: TeamRole;
  invitedBy: string;
  expiresAt: string;
  status: InviteStatus;
};

export type OrgInvite = {
  kind: 'org';
  id: string;
  org: OrgSummary;
  invitedBy: string;
  expiresAt: string;
  status: InviteStatus;
};

export type Invite = TeamInvite | OrgInvite;

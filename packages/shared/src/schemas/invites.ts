import { z } from 'zod';
import { Id, IsoDateTime } from './common';
import { OrgSummary } from './orgs';
import { TeamRole, TeamSummary } from './teams';

export const InviteStatus = z.enum(['pending', 'accepted', 'declined', 'revoked', 'expired']);
export type InviteStatus = z.infer<typeof InviteStatus>;

export const TeamInvite = z.object({
  kind: z.literal('team'),
  id: Id,
  team: z.object({ id: Id, name: z.string(), tag: z.string() }),
  role: TeamRole,
  invitedBy: z.string(),
  expiresAt: IsoDateTime,
  status: InviteStatus,
});
export type TeamInvite = z.infer<typeof TeamInvite>;

export const OrgInvite = z.object({
  kind: z.literal('org'),
  id: Id,
  org: OrgSummary,
  invitedBy: z.string(),
  expiresAt: IsoDateTime,
  status: InviteStatus,
});
export type OrgInvite = z.infer<typeof OrgInvite>;

export const Invite = z.discriminatedUnion('kind', [TeamInvite, OrgInvite]);
export type Invite = z.infer<typeof Invite>;

export const InviteParams = z.object({ id: Id });
export type InviteParams = z.infer<typeof InviteParams>;

export const InvitesResponse = z.object({ invites: z.array(Invite) });
export type InvitesResponse = z.infer<typeof InvitesResponse>;

export const AcceptTeamInviteResponse = z.object({ team: TeamSummary });
export type AcceptTeamInviteResponse = z.infer<typeof AcceptTeamInviteResponse>;

export const DeclineInviteResponse = z.object({ status: z.literal('declined') });
export type DeclineInviteResponse = z.infer<typeof DeclineInviteResponse>;

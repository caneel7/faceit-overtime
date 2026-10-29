import type { OrgRole, OrgSummary } from '@overtime/shared';

export type { OrgRole, OrgSummary } from '@overtime/shared';

export type OrgAdmin = {
  userId: string;
  displayName: string;
  email: string;
  role: OrgRole;
  since: string;
};

export type OrgPendingAdmin = {
  inviteId: string;
  email: string;
  invitedAt: string;
  expiresAt: string;
};

export type MyOrg = OrgSummary & { role: OrgRole };

export type OrgRole = 'owner' | 'admin';

export type OrgSummary = { id: string; slug: string; name: string };

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

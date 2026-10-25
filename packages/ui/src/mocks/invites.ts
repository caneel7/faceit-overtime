import type { Invite, OrgInvite, TeamInvite } from '../models/invite';
import { nightOwlsLeague } from './orgs';
import { daysFromNow, hoursFromNow } from './time';

export const teamPlayerInvite: TeamInvite = {
  kind: 'team',
  id: '01931000-0000-7000-8000-000000000001',
  team: { id: '01930e00-0000-7000-8000-000000000001', name: 'Night Shift', tag: 'NSH' },
  role: 'player',
  invitedBy: 'Kestrel',
  expiresAt: hoursFromNow(6 * 24 + 3),
  status: 'pending',
};

export const teamCoachInvite: TeamInvite = {
  kind: 'team',
  id: '01931000-0000-7000-8000-000000000002',
  team: { id: '01930e00-0000-7000-8000-000000000004', name: 'Lecture Hall Five', tag: 'LH5' },
  role: 'coach',
  invitedBy: 'Mira Holt',
  expiresAt: hoursFromNow(30),
  status: 'pending',
};

export const orgInvite: OrgInvite = {
  kind: 'org',
  id: '01931000-0000-7000-8000-000000000003',
  org: nightOwlsLeague,
  invitedBy: 'Owl Organizer',
  expiresAt: daysFromNow(5),
  status: 'pending',
};

export const expiredInvite: TeamInvite = {
  ...teamPlayerInvite,
  id: '01931000-0000-7000-8000-000000000004',
  team: { id: '01930e00-0000-7000-8000-000000000009', name: 'Dust Devils', tag: 'DD' },
  expiresAt: daysFromNow(-2),
  status: 'expired',
};

export const acceptedInvite: OrgInvite = {
  ...orgInvite,
  id: '01931000-0000-7000-8000-000000000005',
  status: 'accepted',
};

export const PENDING_INVITES: Invite[] = [teamPlayerInvite, orgInvite, teamCoachInvite];
export const ALL_INVITES: Invite[] = [...PENDING_INVITES, expiredInvite, acceptedInvite];

import type { OrgAdmin, OrgPendingAdmin } from '../models/org';
import { daysFromNow, hoursFromNow } from './time';

export const owner: OrgAdmin = {
  userId: '01930c00-0000-7000-8000-000000000001',
  displayName: 'Club Admin',
  email: 'admin@uni-esports.example',
  role: 'owner',
  since: daysFromNow(-120),
};

export const ADMINS: OrgAdmin[] = [
  owner,
  {
    userId: '01930c00-0000-7000-8000-000000000002',
    displayName: 'Sam Referee',
    email: 'sam@uni-esports.example',
    role: 'admin',
    since: daysFromNow(-30),
  },
  {
    userId: '01930c00-0000-7000-8000-000000000003',
    displayName: 'Priya Shah',
    email: 'priya.shah@mail.example',
    role: 'admin',
    since: daysFromNow(-4),
  },
];

export const PENDING_ADMINS: OrgPendingAdmin[] = [
  {
    inviteId: '01930c10-0000-7000-8000-000000000001',
    email: 'new.helper@mail.example',
    invitedAt: hoursFromNow(-20),
    expiresAt: hoursFromNow(7 * 24 - 20),
  },
];

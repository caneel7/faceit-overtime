import type { MyOrg, OrgSummary } from '../models/org';

export const uniEsportsClub: OrgSummary = {
  id: '01930a8e-0000-7000-8000-000000000001',
  slug: 'uni-esports-club',
  name: 'Uni Esports Club',
};

export const nightOwlsLeague: OrgSummary = {
  id: '01930a8e-0000-7000-8000-000000000002',
  slug: 'night-owls-league',
  name: 'Night Owls League',
};

export const MY_ORGS: MyOrg[] = [
  { ...uniEsportsClub, role: 'owner' },
  { ...nightOwlsLeague, role: 'admin' },
];

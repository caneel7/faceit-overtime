import type { OrgSummary } from './org';
import type { Region } from './player';

export const EVENT_STATUSES = [
  'draft',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const BEST_OF = [1, 3, 5] as const;
export type BestOf = (typeof BEST_OF)[number];

export type SwissSettings = {
  winsToAdvance: number;
  lossesToEliminate: number;
  bestOf: BestOf;
  deciderBestOf: BestOf;
};

export type EventSettings = {
  teamSize: 5;
  maxSubs: 0 | 1;
  maxTeams: number;
  minLevel: number | null;
  maxLevel: number | null;
  regions: Region[];
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  swiss: SwissSettings;
};

export type EventSummary = {
  id: string;
  name: string;
  org: OrgSummary;
  status: EventStatus;
  startsAt: string | null;
  registrationClosesAt: string | null;
  registeredTeams: number;
  maxTeams: number;
  minLevel: number | null;
  maxLevel: number | null;
  regions: Region[];
};

export type EventDetail = EventSummary & {
  description: string | null;
  settings: EventSettings;
};

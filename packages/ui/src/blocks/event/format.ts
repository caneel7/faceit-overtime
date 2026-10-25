import type { EventStatus, EventSummary } from '../../models/event';
import type { Region } from '../../models/player';

export const STATUS_LABEL: Record<EventStatus, string> = {
  draft: 'Draft',
  registration_open: 'Registration open',
  registration_closed: 'Registration closed',
  in_progress: 'Live',
  completed: 'Finished',
  cancelled: 'Cancelled',
};

export function levelRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'Any level';
  if (min !== null && max !== null) return min === max ? `Lvl ${min}` : `Lvl ${min}–${max}`;
  if (min !== null) return `Lvl ${min}+`;
  return `Up to Lvl ${max}`;
}

export function regionList(regions: Region[]): string {
  return regions.length ? regions.join(' · ') : 'Any region';
}

export function isFull(event: Pick<EventSummary, 'registeredTeams' | 'maxTeams'>): boolean {
  return event.registeredTeams >= event.maxTeams;
}

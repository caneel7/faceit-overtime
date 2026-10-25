import type { EventDetail, EventSettings, EventSummary } from '../models/event';
import type { EventFilterValue } from '../blocks/event/event-filters';
import { EVENT_FORM_DEFAULTS, type EventFormValues } from '../blocks/event/event-form.schema';
import { nightOwlsLeague, uniEsportsClub } from './orgs';
import { daysFromNow, hoursFromNow } from './time';

function settings(overrides: Partial<EventSettings> = {}): EventSettings {
  return {
    teamSize: 5,
    maxSubs: 1,
    maxTeams: 16,
    minLevel: 4,
    maxLevel: 8,
    regions: ['EU', 'NA'],
    registrationOpensAt: daysFromNow(-3),
    registrationClosesAt: hoursFromNow(52),
    swiss: { winsToAdvance: 3, lossesToEliminate: 3, bestOf: 1, deciderBestOf: 3 },
    ...overrides,
  };
}

function event(
  id: string,
  name: string,
  overrides: Partial<Omit<EventDetail, 'settings'>> & { settings?: Partial<EventSettings> } = {},
): EventDetail {
  const s = settings(overrides.settings);
  return {
    id: `01930b00-0000-7000-8000-0000000000${id}`,
    name,
    org: uniEsportsClub,
    status: 'registration_open',
    startsAt: daysFromNow(3),
    registeredTeams: 9,
    description:
      'Swiss stage for the club season. Matches are played on FACEIT; captains report results here.\n\nMap pool: Ancient, Anubis, Dust2, Inferno, Mirage, Nuke, Train. Check-in opens 30 minutes before round 1.',
    ...overrides,
    settings: s,
    maxTeams: s.maxTeams,
    minLevel: s.minLevel,
    maxLevel: s.maxLevel,
    regions: s.regions,
    registrationClosesAt: s.registrationClosesAt,
  };
}

export const openEvent = event('01', 'Autumn Cup #3');
export const almostFullEvent = event('02', 'Freshers Showdown', { registeredTeams: 15 });
export const fullEvent = event('03', 'Weekend Clash', { registeredTeams: 16 });
export const anyoneEvent = event('04', 'Open Night Swiss', {
  org: nightOwlsLeague,
  registeredTeams: 3,
  settings: { minLevel: null, maxLevel: null, regions: [], maxTeams: 32 },
});
export const notOpenYetEvent = event('05', 'Winter Qualifier', {
  status: 'draft',
  registeredTeams: 0,
  startsAt: daysFromNow(20),
  settings: { registrationOpensAt: daysFromNow(4), registrationClosesAt: daysFromNow(14) },
});
export const closedEvent = event('06', 'October Invitational', {
  status: 'registration_closed',
  registeredTeams: 16,
  startsAt: hoursFromNow(20),
  settings: { registrationOpensAt: daysFromNow(-10), registrationClosesAt: hoursFromNow(-6) },
});
export const liveEvent = event('07', 'Night Owls Weekly #12', {
  org: nightOwlsLeague,
  status: 'in_progress',
  registeredTeams: 16,
  startsAt: hoursFromNow(-2),
  settings: {
    minLevel: 6,
    maxLevel: null,
    regions: ['EU'],
    registrationOpensAt: daysFromNow(-7),
    registrationClosesAt: daysFromNow(-1),
  },
});
export const finishedEvent = event('08', 'Summer Swiss Finals', {
  status: 'completed',
  registeredTeams: 16,
  startsAt: daysFromNow(-40),
  settings: { registrationOpensAt: daysFromNow(-60), registrationClosesAt: daysFromNow(-45) },
});
export const cancelledEvent = event('09', 'Halloween Mix-up', {
  status: 'cancelled',
  registeredTeams: 4,
  startsAt: daysFromNow(6),
});
export const draftEvent = event('10', 'Spring League Draft', {
  status: 'draft',
  registeredTeams: 0,
  startsAt: null,
  description: null,
  settings: { registrationOpensAt: null, registrationClosesAt: null },
});

export const PUBLIC_EVENTS: EventSummary[] = [
  openEvent,
  almostFullEvent,
  anyoneEvent,
  fullEvent,
  closedEvent,
  liveEvent,
  finishedEvent,
  cancelledEvent,
];

export const ORG_EVENTS: EventSummary[] = [
  draftEvent,
  notOpenYetEvent,
  openEvent,
  almostFullEvent,
  closedEvent,
  finishedEvent,
  cancelledEvent,
];

export function filterEvents(events: EventSummary[], filters: EventFilterValue): EventSummary[] {
  return events.filter((e) => {
    if (filters.status === 'open' && e.status !== 'registration_open') return false;
    if (filters.status === 'live' && e.status !== 'in_progress') return false;
    if (filters.status === 'finished' && e.status !== 'completed') return false;
    if (filters.region && e.regions.length > 0 && !e.regions.includes(filters.region)) return false;
    if (filters.level !== null) {
      if (e.minLevel !== null && filters.level < e.minLevel) return false;
      if (e.maxLevel !== null && filters.level > e.maxLevel) return false;
    }
    return true;
  });
}

export const draftFormValues: EventFormValues = {
  ...EVENT_FORM_DEFAULTS,
  name: 'Spring League Draft',
  description: 'Weekly Swiss for club members.',
  minLevel: 4,
  maxLevel: 8,
  regions: ['EU'],
  registrationOpensAt: '2026-11-01T18:00',
  registrationClosesAt: '2026-11-07T18:00',
};

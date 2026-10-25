import type { LiveEvent, MatchSummary, MatchTeam } from '../models/match';
import { liveEvent } from './events';
import { campusClashSociety, uniEsportsClub } from './orgs';
import { hoursFromNow } from './time';

const TEAMS: MatchTeam[] = [
  { name: 'Night Shift', tag: 'NSH', seed: 1 },
  { name: 'Lecture Hall Five', tag: 'LH5', seed: 2 },
  { name: 'Dust Devils', tag: 'DD', seed: 3 },
  { name: 'Half Buy', tag: 'HB', seed: 4 },
  { name: 'Eco Warriors', tag: 'ECO', seed: 5 },
  { name: 'Late Rotate', tag: 'LR8', seed: 6 },
  { name: 'Smoke Criminals', tag: 'SMK', seed: 7 },
  { name: 'Clutch Club', tag: 'CLU', seed: 8 },
  { name: 'Retake Kings', tag: 'RTK', seed: 9 },
  { name: 'Mid Control', tag: 'MID', seed: 10 },
];

function match(
  id: number,
  a: number,
  b: number,
  state: MatchSummary['state'] = 'pending',
  score: MatchSummary['score'] = null,
  bestOf: MatchSummary['bestOf'] = 1,
): MatchSummary {
  return {
    id: `01931100-0000-7000-8000-${String(id).padStart(12, '0')}`,
    bestOf,
    a: TEAMS[a]!,
    b: TEAMS[b]!,
    state,
    score,
  };
}

export const LIVE_EVENTS: LiveEvent[] = [
  {
    event: liveEvent,
    round: 3,
    matches: [
      match(1, 0, 2, 'completed', { a: 13, b: 9 }),
      match(2, 1, 3),
      match(3, 4, 6, 'completed', { a: 16, b: 14 }),
      match(4, 5, 7),
      match(5, 8, 9, 'forfeited', { a: 1, b: 0 }),
      match(6, 3, 6, 'pending', null, 3),
    ],
  },
  {
    event: {
      ...liveEvent,
      id: '01930b00-0000-7000-8000-000000000011',
      name: 'Campus Clash Weekly',
      org: campusClashSociety,
      registeredTeams: 8,
      maxTeams: 8,
      startsAt: hoursFromNow(-1),
      minLevel: 3,
      maxLevel: 7,
      regions: ['EU', 'NA'],
    },
    round: 1,
    matches: [match(7, 0, 4), match(8, 1, 5), match(9, 2, 6), match(10, 3, 7)],
  },
];

export const ONE_LIVE_EVENT: LiveEvent[] = [
  { ...LIVE_EVENTS[1]!, event: { ...LIVE_EVENTS[1]!.event, org: uniEsportsClub } },
];

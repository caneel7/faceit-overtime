import type { BestOf, EventSummary } from './event';

export type MatchTeam = { name: string; tag: string; seed: number };

export type MatchState = 'pending' | 'completed' | 'forfeited';

export type MatchSummary = {
  id: string;
  bestOf: BestOf;
  a: MatchTeam;
  b: MatchTeam;
  state: MatchState;
  score: { a: number; b: number } | null;
};

export type LiveEvent = {
  event: EventSummary;
  round: number;
  matches: MatchSummary[];
};

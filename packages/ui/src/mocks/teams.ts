import type { PlayerSummary } from '../models/player';
import type {
  InviteCandidate,
  TeamDetail,
  TeamMember,
  TeamPendingInvite,
  TeamSummary,
} from '../models/team';
import { ashfall, brisk, kestrel, nightjar, quillon, tamarind, vexa } from './players';
import { daysFromNow, hoursFromNow } from './time';

let nextId = 1;
function userId() {
  return `01930d00-0000-7000-8000-${String(nextId++).padStart(12, '0')}`;
}

function member(
  player: PlayerSummary | null,
  displayName: string,
  role: TeamMember['role'],
  joinedDaysAgo: number,
  isCaptain = false,
): TeamMember {
  return {
    userId: userId(),
    displayName,
    role,
    isCaptain,
    player,
    joinedAt: daysFromNow(-joinedDaysAgo),
  };
}

export const captain = member(kestrel, 'Kestrel', 'player', 60, true);
const players = [
  member(nightjar, 'Nightjar', 'player', 58),
  member(tamarind, 'Tamarind', 'player', 40),
  member(vexa, 'Vexa', 'player', 21),
  member(brisk, 'Brisk', 'player', 12),
  member(quillon, 'Quillon', 'player', 3),
];
export const coach = member(null, 'Mira Holt', 'coach', 30);

function average(members: TeamMember[]) {
  const elos = members.flatMap((m) =>
    m.role === 'player' && m.player?.cs2Elo ? [m.player.cs2Elo] : [],
  );
  return elos.length ? Math.round(elos.reduce((a, b) => a + b, 0) / elos.length) : null;
}

function team(
  id: string,
  name: string,
  tag: string,
  members: TeamMember[],
  pendingInvites: TeamPendingInvite[] = [],
): TeamDetail {
  return {
    id: `01930e00-0000-7000-8000-0000000000${id}`,
    name,
    tag,
    avgElo: average(members),
    members,
    pendingInvites,
  };
}

const pendingPlayer: TeamPendingInvite = {
  inviteId: '01930f00-0000-7000-8000-000000000001',
  displayName: 'Ashfall',
  role: 'player',
  expiresAt: hoursFromNow(6 * 24 + 3),
};

export const fullTeam = team('01', 'Night Shift', 'NSH', [captain, ...players, coach]);
export const partialTeam = team(
  '02',
  'Night Shift',
  'NSH',
  [captain, ...players.slice(0, 3)],
  [pendingPlayer],
);
export const newTeam = team('03', 'Night Shift', 'NSH', [captain]);
export const coachLedTeam = team('04', 'Lecture Hall Five', 'LH5', [{ ...coach, isCaptain: true }]);

export const viewerAsMember = players[0]!;

export const MY_TEAMS: TeamSummary[] = [
  {
    id: fullTeam.id,
    name: 'Night Shift',
    tag: 'NSH',
    myRole: 'player',
    isCaptain: true,
    memberCount: 7,
  },
  {
    id: coachLedTeam.id,
    name: 'Lecture Hall Five',
    tag: 'LH5',
    myRole: 'coach',
    isCaptain: false,
    memberCount: 4,
  },
];

export const CANDIDATES: InviteCandidate[] = [
  { userId: userId(), displayName: 'Ashfall', player: ashfall },
  { userId: userId(), displayName: 'Sam Referee', player: null },
];

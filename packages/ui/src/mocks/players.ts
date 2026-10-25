import type { PlayerSummary } from '../models/player';

function player(
  nickname: string,
  country: string,
  cs2Level: number,
  cs2Elo: number,
  cs2Region: PlayerSummary['cs2Region'],
): PlayerSummary {
  return { nickname, avatarUrl: null, country, cs2Level, cs2Elo, cs2Region };
}

export const kestrel = player('kestrel', 'GB', 10, 2410, 'EU');
export const nightjar = player('nightjar', 'SE', 9, 2105, 'EU');
export const tamarind = player('tamarind', 'PL', 8, 1890, 'EU');
export const vexa = player('vexa', 'DE', 7, 1720, 'EU');
export const brisk = player('brisk', 'FR', 6, 1560, 'EU');
export const quillon = player('quillon', 'DK', 5, 1405, 'EU');
export const ashfall = player('ashfall', 'US', 9, 2050, 'NA');
export const peregrin = player('peregrin', 'CA', 4, 1250, 'NA');
export const lumen = player('lumen', 'BR', 7, 1690, 'SA');
export const corvid = player('corvid', 'AU', 6, 1530, 'OCE');
export const saltmarsh = player('saltmarsh', 'SG', 3, 1010, 'SEA');
export const mollusk = player('mollusk', 'FI', 2, 870, 'EU');

export const noCs2Profile: PlayerSummary = {
  nickname: 'fresh-account',
  avatarUrl: null,
  country: null,
  cs2Level: null,
  cs2Elo: null,
  cs2Region: null,
};

export const PLAYERS: PlayerSummary[] = [
  kestrel,
  nightjar,
  tamarind,
  vexa,
  brisk,
  quillon,
  ashfall,
  peregrin,
  lumen,
  corvid,
  saltmarsh,
  mollusk,
];

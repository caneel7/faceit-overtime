export const REGIONS = ['EU', 'NA', 'SA', 'OCE', 'SEA'] as const;
export type Region = (typeof REGIONS)[number];

export type PlayerSummary = {
  nickname: string;
  avatarUrl: string | null;
  country: string | null;
  cs2Level: number | null;
  cs2Elo: number | null;
  cs2Region: Region | null;
};

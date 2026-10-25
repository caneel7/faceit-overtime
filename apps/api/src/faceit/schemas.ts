import { z } from '@overtime/shared';

export type FaceitIdentity = {
  faceitPlayerId: string;
  nickname: string;
  avatarUrl: string | null;
};

export type FaceitPlayer = FaceitIdentity & {
  country: string | null;
  cs2Level: number | null;
  cs2Elo: number | null;
  cs2Region: string | null;
};

const MAX_NICKNAME = 64;

function httpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function countryCode(value: string | undefined): string | null {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

function levelOrNull(value: number | undefined): number | null {
  return value !== undefined && Number.isInteger(value) && value >= 1 && value <= 10 ? value : null;
}

function eloOrNull(value: number | undefined): number | null {
  return value !== undefined && Number.isInteger(value) && value >= 0 ? value : null;
}

function textOrNull(value: string | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

const Id = z.string().trim().min(1);
const Nickname = z.string().trim().min(1).max(MAX_NICKNAME);

export const FaceitTokenResponse = z.object({ access_token: z.string().min(1) });

export const FaceitUserinfo = z
  .object({ guid: Id, nickname: Nickname, picture: z.string().optional() })
  .transform((raw): FaceitIdentity => ({
    faceitPlayerId: raw.guid,
    nickname: raw.nickname,
    avatarUrl: httpsUrl(raw.picture),
  }));

export const FaceitDataPlayer = z
  .object({
    player_id: Id,
    nickname: Nickname,
    avatar: z.string().optional(),
    country: z.string().optional(),
    games: z
      .object({
        cs2: z
          .object({
            skill_level: z.number().optional(),
            faceit_elo: z.number().optional(),
            region: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .transform((raw): FaceitPlayer => {
    const cs2 = raw.games?.cs2;
    return {
      faceitPlayerId: raw.player_id,
      nickname: raw.nickname,
      avatarUrl: httpsUrl(raw.avatar),
      country: countryCode(raw.country),
      cs2Level: levelOrNull(cs2?.skill_level),
      cs2Elo: eloOrNull(cs2?.faceit_elo),
      cs2Region: textOrNull(cs2?.region),
    };
  });

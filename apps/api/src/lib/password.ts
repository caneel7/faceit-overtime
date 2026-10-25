import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { fromBase64Url, toBase64Url } from './crypto';

export const PASSWORD_PARAMS = { ln: 14, r: 8, p: 5, keyLength: 32, saltLength: 16 } as const;

type Params = { ln: number; r: number; p: number };

function derive(password: string, salt: Uint8Array, params: Params, keyLength: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(
      password.normalize('NFKC'),
      salt,
      keyLength,
      { N: 2 ** params.ln, r: params.r, p: params.p, maxmem: 64 * 1024 * 1024 },
      (err, key) => (err ? reject(err) : resolve(key)),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const { ln, r, p, keyLength, saltLength } = PASSWORD_PARAMS;
  const salt = randomBytes(saltLength);
  const hash = await derive(password, salt, { ln, r, p }, keyLength);
  return `$scrypt$ln=${ln},r=${r},p=${p}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

function parse(stored: string): { params: Params; salt: Uint8Array; hash: Uint8Array } | null {
  const match = /^\$scrypt\$ln=(\d+),r=(\d+),p=(\d+)\$([\w-]+)\$([\w-]+)$/.exec(stored);
  if (!match) return null;
  const [, ln, r, p, salt, hash] = match;
  return {
    params: { ln: Number(ln), r: Number(r), p: Number(p) },
    salt: fromBase64Url(salt!),
    hash: fromBase64Url(hash!),
  };
}

export async function verifyPassword(
  stored: string,
  password: string,
): Promise<{ ok: boolean; needsRehash: boolean }> {
  const parsed = parse(stored);
  if (!parsed) return { ok: false, needsRehash: false };
  const candidate = await derive(password, parsed.salt, parsed.params, parsed.hash.length);
  const ok = candidate.length === parsed.hash.length && timingSafeEqual(candidate, parsed.hash);
  const { ln, r, p } = PASSWORD_PARAMS;
  const current = parsed.params.ln === ln && parsed.params.r === r && parsed.params.p === p;
  return { ok, needsRehash: ok && !current };
}

let dummy: Promise<string> | undefined;

export function dummyPasswordHash(): Promise<string> {
  dummy ??= hashPassword(toBase64Url(randomBytes(16)));
  return dummy;
}

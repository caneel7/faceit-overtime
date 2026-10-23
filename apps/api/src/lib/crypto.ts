const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(bytes = 32): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256Hex(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

const keyCache = new Map<string, Promise<CryptoKey>>();

function importKey(secret: string, usage: 'aes' | 'hmac'): Promise<CryptoKey> {
  const cacheKey = `${usage}:${secret}`;
  let key = keyCache.get(cacheKey);
  if (!key) {
    const raw = fromBase64(secret);
    if (raw.length !== 32) throw new Error('Keys must be 32 bytes, base64-encoded');
    key =
      usage === 'aes'
        ? crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt'])
        : crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    keyCache.set(cacheKey, key);
  }
  return key;
}

export async function encrypt(secret: string, plaintext: string, aad: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(aad) },
    await importKey(secret, 'aes'),
    encoder.encode(plaintext),
  );
  return `v1.${toBase64Url(iv)}.${toBase64Url(new Uint8Array(ciphertext))}`;
}

export async function decrypt(secret: string, value: string, aad: string): Promise<string> {
  const [version, iv, ciphertext] = value.split('.');
  if (version !== 'v1' || !iv || !ciphertext) throw new Error('Unknown ciphertext format');
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64Url(iv), additionalData: encoder.encode(aad) },
    await importKey(secret, 'aes'),
    fromBase64Url(ciphertext),
  );
  return decoder.decode(plaintext);
}

export async function blindIndex(
  secret: string,
  domain: 'email' | 'ip',
  value: string,
): Promise<string> {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await importKey(secret, 'hmac'),
    encoder.encode(`${domain}:${value}`),
  );
  return toHex(signature);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeIp(ip: string): string {
  const value = ip.trim().toLowerCase();
  if (!value.includes(':')) return value;
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(value);
  if (mapped) return mapped[1]!;
  try {
    return new URL(`http://[${value}]`).hostname.slice(1, -1);
  } catch {
    return value;
  }
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

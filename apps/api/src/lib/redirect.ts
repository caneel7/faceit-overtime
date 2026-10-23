export const DEFAULT_NEXT = '/dashboard';

function hasUnsafeCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f || code === 0x5c) return true;
  }
  return false;
}

export function safeNext(next: string | null | undefined, fallback = DEFAULT_NEXT): string {
  if (!next || next.length > 512) return fallback;
  if (!next.startsWith('/') || next.startsWith('//')) return fallback;
  if (hasUnsafeCharacter(next)) return fallback;
  return next;
}

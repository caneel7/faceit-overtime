import type { z } from '@overtime/shared';

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export function fieldErrors<K extends string>(
  error: z.ZodError,
  messages: Record<K, string>,
): FieldErrors<K> {
  const out: FieldErrors<K> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && key in messages && !out[key as K]) {
      out[key as K] = messages[key as K];
    }
  }
  return out;
}

export const FIELD_MESSAGES = {
  email: 'Enter a valid email address.',
  password: 'Use 10 to 128 characters.',
  displayName: 'Use 1 to 32 characters.',
  currentPassword: 'Enter your password.',
} as const;

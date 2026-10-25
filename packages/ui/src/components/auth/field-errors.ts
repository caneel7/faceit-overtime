export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const FIELD_MESSAGES = {
  email: 'Enter a valid email address.',
  password: 'Use 10 to 128 characters.',
  displayName: 'Use 1 to 32 characters.',
  currentPassword: 'Enter your password.',
} as const;

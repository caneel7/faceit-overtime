import { DisplayName, Email, Password, z } from '@overtime/shared';

export const ORG_SLUG_PATTERN = /^[a-z0-9-]{3,40}$/;

export const OrgFields = z.object({
  orgName: z.string().trim().min(1).max(64),
  slug: z.string().trim().regex(ORG_SLUG_PATTERN),
});
export type OrgFields = z.infer<typeof OrgFields>;

export const AccountAndOrgFields = OrgFields.extend({
  displayName: DisplayName,
  email: Email,
  password: Password,
});
export type AccountAndOrgFields = z.infer<typeof AccountAndOrgFields>;

export type RegisterOrgValues = {
  org: { name: string; slug: string };
  account: { displayName: string; email: string; password: string } | null;
};

export const ORG_FIELD_MESSAGES = {
  orgName: 'Use 1 to 64 characters.',
  slug: 'Use 3 to 40 lowercase letters, numbers or dashes.',
} as const;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
}

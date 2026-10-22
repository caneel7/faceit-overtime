import { describe, expect, it } from 'vitest';
import { DisplayName, Email, EmailAvailable, Me, OpaqueToken, Password, SignUpBody } from '../src';

describe('Email', () => {
  it('trims surrounding whitespace', () => {
    expect(Email.parse('  admin@uni-esports.club ')).toBe('admin@uni-esports.club');
  });

  it.each(['', 'not-an-email', 'a@', '@b.com', `${'a'.repeat(250)}@b.com`])('rejects %j', (v) => {
    expect(Email.safeParse(v).success).toBe(false);
  });
});

describe('Password', () => {
  it('accepts 10 to 128 characters with no composition rules', () => {
    expect(Password.safeParse('a'.repeat(10)).success).toBe(true);
    expect(Password.safeParse('a'.repeat(128)).success).toBe(true);
    expect(Password.safeParse('correct horse battery staple').success).toBe(true);
  });

  it('rejects shorter than 10 or longer than 128', () => {
    expect(Password.safeParse('a'.repeat(9)).success).toBe(false);
    expect(Password.safeParse('a'.repeat(129)).success).toBe(false);
  });

  it('does not trim, so spaces count', () => {
    expect(Password.parse(' '.repeat(10))).toBe(' '.repeat(10));
  });
});

describe('DisplayName', () => {
  it('trims and requires 1 to 32 characters', () => {
    expect(DisplayName.parse('  Club Admin ')).toBe('Club Admin');
    expect(DisplayName.safeParse('   ').success).toBe(false);
    expect(DisplayName.safeParse('x'.repeat(33)).success).toBe(false);
  });
});

describe('OpaqueToken', () => {
  it('accepts 43 base64url characters only', () => {
    expect(OpaqueToken.safeParse('A'.repeat(42) + '_').success).toBe(true);
    expect(OpaqueToken.safeParse('A'.repeat(42)).success).toBe(false);
    expect(OpaqueToken.safeParse('A'.repeat(44)).success).toBe(false);
    expect(OpaqueToken.safeParse('A'.repeat(42) + '+').success).toBe(false);
    expect(OpaqueToken.safeParse('A'.repeat(42) + '=').success).toBe(false);
  });
});

describe('SignUpBody', () => {
  it('reports every invalid field at once', () => {
    const result = SignUpBody.safeParse({ email: 'x', password: 'short', displayName: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => i.path[0]).sort()).toEqual([
      'displayName',
      'email',
      'password',
    ]);
  });
});

describe('EmailAvailable', () => {
  it('is a boolean answer only', () => {
    expect(EmailAvailable.parse({ available: false })).toEqual({ available: false });
    expect(EmailAvailable.safeParse({ available: 'no' }).success).toBe(false);
  });
});

describe('Me', () => {
  const base = {
    user: {
      id: '0199f1e2-7c3a-7000-8000-000000000001',
      displayName: 'Club Admin',
      email: 'admin@uni-esports.club',
      emailVerified: true,
      hasPassword: true,
      createdAt: '2026-10-24T10:00:00.000Z',
    },
    identities: [],
    player: null,
  };

  it('accepts an email account without FACEIT', () => {
    expect(Me.safeParse(base).success).toBe(true);
  });

  it('accepts a FACEIT account with a player and no email', () => {
    const faceitOnly = {
      ...base,
      user: {
        ...base.user,
        email: null,
        emailVerified: false,
        hasPassword: false,
      },
      identities: [
        { provider: 'faceit', providerUserId: 'abc', linkedAt: '2026-10-24T10:00:00.000Z' },
      ],
      player: {
        id: '0199f1e2-7c3a-7000-8000-000000000002',
        faceitPlayerId: 'abc',
        nickname: 's1mple',
        avatarUrl: null,
        country: 'UA',
        cs2Level: 10,
        cs2Elo: 3200,
        cs2Region: 'EU',
        syncedAt: '2026-10-24T10:00:00.000Z',
      },
    };
    expect(Me.safeParse(faceitOnly).success).toBe(true);
  });

  it('rejects an unknown identity provider', () => {
    const steam = {
      ...base,
      identities: [{ provider: 'steam', providerUserId: '1', linkedAt: base.user.createdAt }],
    };
    expect(Me.safeParse(steam).success).toBe(false);
  });
});

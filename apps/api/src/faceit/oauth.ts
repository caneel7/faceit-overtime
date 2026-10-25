import type { Bindings } from '../env';
import { toBase64Url } from '../lib/crypto';
import { FaceitTokenResponse, FaceitUserinfo, type FaceitIdentity } from './schemas';

const AUTHORIZE_URL = 'https://accounts.faceit.com';
const TOKEN_URL = 'https://api.faceit.com/auth/v1/oauth/token';
const USERINFO_URL = 'https://api.faceit.com/auth/v1/resources/userinfo';
const SCOPE = 'openid profile';
const TIMEOUT_MS = 5000;

type FaceitOAuthConfig = { clientId: string; clientSecret: string; redirectUri: string };

export class FaceitOAuth {
  constructor(private readonly config: FaceitOAuthConfig) {}

  static fromEnv(env: Bindings): FaceitOAuth {
    return new FaceitOAuth({
      clientId: env.FACEIT_CLIENT_ID,
      clientSecret: env.FACEIT_CLIENT_SECRET,
      redirectUri: `${env.APP_URL}/api/auth/faceit/callback`,
    });
  }

  async authorizeUrl(input: { state: string; verifier: string }): Promise<string> {
    const url = new URL(AUTHORIZE_URL);
    url.search = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: SCOPE,
      state: input.state,
      code_challenge: await codeChallenge(input.verifier),
      code_challenge_method: 'S256',
      redirect_popup: 'true',
    }).toString();
    return url.toString();
  }

  async identify(code: string, verifier: string): Promise<FaceitIdentity> {
    return this.userinfo(await this.exchangeCode(code, verifier));
  }

  private async exchangeCode(code: string, verifier: string): Promise<string> {
    const { clientId, clientSecret, redirectUri } = this.config;
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'content-type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier: verifier,
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`FACEIT token exchange responded ${res.status}`);
    return FaceitTokenResponse.parse(await res.json()).access_token;
  }

  private async userinfo(accessToken: string): Promise<FaceitIdentity> {
    const res = await fetch(USERINFO_URL, {
      headers: { authorization: `Bearer ${accessToken}`, accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`FACEIT userinfo responded ${res.status}`);
    return FaceitUserinfo.parse(await res.json());
  }
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return toBase64Url(new Uint8Array(digest));
}

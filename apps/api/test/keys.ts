import { exportPKCS8, generateKeyPair } from 'jose';

export async function testSigningKey(): Promise<string> {
  const { privateKey } = await generateKeyPair('ES256', { extractable: true });
  return exportPKCS8(privateKey);
}

export function testSecret(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
}

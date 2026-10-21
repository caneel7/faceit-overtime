import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source, so Next compiles them
  transpilePackages: ['@overtime/shared', '@overtime/ui'],
  // Stop `next dev` from generating an AGENTS.md file in the app directory
  agentRules: false,
};

export default nextConfig;

// Exposes wrangler bindings (the API service binding) to `next dev`
initOpenNextCloudflareForDev();

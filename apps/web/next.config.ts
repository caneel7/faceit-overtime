import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@overtime/shared', '@overtime/ui'],
  agentRules: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();

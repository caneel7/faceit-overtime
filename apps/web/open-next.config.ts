import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = {
  ...defineCloudflareConfig(),
  // OpenNext defaults to `<package manager> run build`, which is this same OpenNext build
  buildCommand: 'next build',
};

export default config;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',   // generates fully static HTML — no server needed
  trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gamenative-config-converter',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

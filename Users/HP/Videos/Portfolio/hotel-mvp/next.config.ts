import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // safer to enable
  compiler: {
    reactRemoveProperties: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  // Enable WASM SWC to avoid native binary issues on Windows
  swcMinify: true,
  experimental: {
    wasmSWC: true,
  },
};

export default nextConfig;

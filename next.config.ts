import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,

  compiler: {
    reactRemoveProperties: true,
  },

  async rewrites() {
    return [
      {
        source: "/admin/:path*",
        destination: "/admin/:path*",
      },
    ]
  },
}

export default nextConfig

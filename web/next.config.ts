import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "meetinginbeijing.com",
      },
    ],
  },
};

export default nextConfig;

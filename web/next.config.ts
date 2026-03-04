import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "meetinginbeijing.com",
      },
      {
        protocol: "https",
        hostname: "meetinginbeijing.oss-cn-beijing.aliyuncs.com",
      },
    ],
  },
};

export default nextConfig;

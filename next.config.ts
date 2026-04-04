import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.71"],
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination: `http://localhost:8080/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

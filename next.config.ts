import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const backend = process.env.BACKEND_URL ?? "http://localhost:4000";
    return [
      { source: "/csrf-token", destination: `${backend}/csrf-token` },
      { source: "/health", destination: `${backend}/health` },
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
    ];
  },
};

export default nextConfig;

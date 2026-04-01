import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent better-sqlite3 (a native Node.js module) from being bundled by webpack
  serverExternalPackages: ["better-sqlite3"],

  // Ensure SQLite DB files are included in Vercel's output file tracing
  outputFileTracingIncludes: {
    "/api/reference": ["./data/**"],
    "/api/plan": ["./data/**"],
  },
};

export default nextConfig;

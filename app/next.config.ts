import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The escrow API routes read their deployed-contract address at runtime from
  // ../contracts/deployments/<network>.json (see lib/escrow/chain.ts). That file
  // lives outside this app directory, so Vercel's serverless bundler omits it by
  // default. Point the tracing root at the repo root and force-include the
  // deployment files so the escrow endpoints can find them in production.
  outputFileTracingRoot: path.join(process.cwd(), ".."),
  outputFileTracingIncludes: {
    "/api/escrow/**": ["../contracts/deployments/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

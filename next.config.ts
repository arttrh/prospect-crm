import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["oracledb"],
  outputFileTracingIncludes: {
    "/preview/*": ["./.generated/diego-template.html", "./vendor/diego-astro/PROVENANCE.json"],
  },
};

export default nextConfig;

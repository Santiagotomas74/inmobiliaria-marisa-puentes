import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/@img/sharp-linux-x64/**/*"],
  },
};

export default nextConfig;

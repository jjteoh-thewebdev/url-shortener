import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // final output is a standalone app that can be run without node_modules
  output: "standalone",
};

export default nextConfig;

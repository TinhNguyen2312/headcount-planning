import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "antd",
    "@ant-design/icons",
    "@ant-design/nextjs-registry",
    "@xyflow/react",
    "dagre",
    "zustand",
    "@astryxdesign/core",
    "@astryxdesign/theme-neutral",
  ],
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

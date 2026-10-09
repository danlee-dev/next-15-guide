import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 예전 주소로 들어오면 새 주소(nextku-dev)로 보낸다. 예전 주소가 이 프로젝트 도메인으로 붙어 있을 때만 동작한다
  async redirects() {
    return ["next-session8.vercel.app", "next-guide-15.vercel.app"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://nextku-dev.vercel.app/:path*",
      permanent: false,
    }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

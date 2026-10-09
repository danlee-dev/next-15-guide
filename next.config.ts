import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 예전 주소로 들어오면 새 주소로 보낸다. 구글 로그인 후 돌아올 주소는 next-guide-15 만 허용돼 있다
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "next-session8.vercel.app" }],
        destination: "https://next-guide-15.vercel.app/:path*",
        permanent: false,
      },
    ];
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

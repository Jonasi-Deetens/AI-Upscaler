import type { NextConfig } from "next";

// Where to proxy /api/* (server-side). Browser uses relative /api when NEXT_PUBLIC_API_URL is empty.
const BACKEND_PROXY_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_PROXY_URL}/api/:path*` }];
  },
  async headers() {
    let apiOrigin = "";
    try {
      if (process.env.NEXT_PUBLIC_API_URL) {
        apiOrigin = ` ${new URL(process.env.NEXT_PUBLIC_API_URL).origin}`;
      }
    } catch {
      // ignore
    }
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://images.unsplash.com${apiOrigin}; connect-src 'self'${apiOrigin}; frame-ancestors 'none';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

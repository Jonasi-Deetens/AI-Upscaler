import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:${apiOrigin}; connect-src 'self'${apiOrigin}; frame-ancestors 'none';`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

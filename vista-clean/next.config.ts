import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security: Prevent clickjacking attacks by forbidding iframe embedding
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Security: Prevent MIME-sniffing and force browser to follow declared content-type
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Security: Prevent leaking full referrer URL to cross-origin destinations
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Security: Restrict unnecessary browser feature and sensor access
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Security: Enforce HTTPS and prevent SSL-stripping/man-in-the-middle attacks (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Security: Enable legacy browser XSS filtering defense-in-depth
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

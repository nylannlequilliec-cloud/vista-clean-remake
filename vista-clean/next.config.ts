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
          // Security: Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Security: Limit referrer leakage on cross-origin requests
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Security: Disable unused browser features and hardware APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Security: Enforce HTTPS for 2 years including subdomains and preloading to prevent MITM / SSL-stripping
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

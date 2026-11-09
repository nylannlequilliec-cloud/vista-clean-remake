import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not expose Next.js fingerprinting in response headers
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking by forbidding embedding in iframes
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME-sniffing vulnerabilities
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Limit referrer information sent to external domains
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict browser features and sensitive device APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Enforce HTTPS and mitigate SSL stripping attacks (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Defense-in-depth XSS filter activation for legacy browsers
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

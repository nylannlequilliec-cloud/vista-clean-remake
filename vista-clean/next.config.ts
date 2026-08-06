import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking attacks by forbidding framing
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Protect against MIME type confusion/sniffing attacks
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control how much referrer information is shared
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Restrict access to sensitive browser features (camera, microphone, geolocation)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Enforce HTTPS (HTTP Strict Transport Security) to prevent SSL stripping / MitM attacks
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

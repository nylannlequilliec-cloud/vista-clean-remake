import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("HTTP Security Headers Configuration", () => {
  it("should configure required security headers for all routes", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(headersConfig).toHaveLength(1);

    const mainRouteConfig = headersConfig[0];
    expect(mainRouteConfig.source).toBe("/(.*)");

    const headerMap = new Map(
      mainRouteConfig.headers.map(({ key, value }) => [key, value]),
    );

    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headerMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headerMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headerMap.get("X-DNS-Prefetch-Control")).toBe("on");
  });
});

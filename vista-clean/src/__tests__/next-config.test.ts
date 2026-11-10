import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Next.js Security Hardening Configuration", () => {
  it("disables poweredByHeader to avoid framework information disclosure", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("configures essential security HTTP headers for all routes", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    const globalRule = headersConfig.find((entry) => entry.source === "/(.*)");

    expect(globalRule).toBeDefined();

    const headersMap = new Map(
      globalRule?.headers.map((h) => [h.key, h.value]),
    );

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headersMap.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

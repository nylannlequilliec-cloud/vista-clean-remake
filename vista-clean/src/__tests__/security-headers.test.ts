import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("HTTP Security Configuration", () => {
  it("disables the X-Powered-By header to prevent fingerprinting", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("configures essential HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersList = await nextConfig.headers();
    const globalRule = headersList.find((rule) => rule.source === "/(.*)");

    expect(globalRule).toBeDefined();
    const headersMap = new Map(
      globalRule?.headers.map((h) => [h.key, h.value])
    );

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headersMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

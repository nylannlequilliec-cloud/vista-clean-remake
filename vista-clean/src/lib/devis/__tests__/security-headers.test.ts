import { describe, expect, it } from "vitest";
import nextConfig from "../../../../next.config";

describe("HTTP Security Headers Configuration", () => {
  it("exports all critical HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    const headersConfig = await nextConfig.headers!();

    const globalHeaders = headersConfig.find((config) => config.source === "/(.*)");
    expect(globalHeaders).toBeDefined();

    const headersMap = new Map<string, string>();
    globalHeaders?.headers.forEach((h) => {
      headersMap.set(h.key, h.value);
    });

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headersMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headersMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
    expect(headersMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });
});

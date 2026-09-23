import { describe, expect, it } from "vitest";
import nextConfig from "../../../../next.config";

describe("Security Headers Configuration", () => {
  it("includes essential HTTP security headers in next.config.ts", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (typeof nextConfig.headers === "function") {
      const headerConfigs = await nextConfig.headers();
      expect(headerConfigs.length).toBeGreaterThan(0);

      const catchAll = headerConfigs.find((config) => config.source === "/(.*)");
      expect(catchAll).toBeDefined();

      const headerMap = new Map(
        catchAll?.headers.map((h) => [h.key, h.value])
      );

      // Verify Strict-Transport-Security (HSTS)
      expect(headerMap.get("Strict-Transport-Security")).toBe(
        "max-age=63072000; includeSubDomains; preload"
      );

      // Verify X-Frame-Options
      expect(headerMap.get("X-Frame-Options")).toBe("DENY");

      // Verify X-Content-Type-Options
      expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");

      // Verify Referrer-Policy
      expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");

      // Verify Permissions-Policy
      expect(headerMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");

      // Verify X-XSS-Protection
      expect(headerMap.get("X-XSS-Protection")).toBe("1; mode=block");
    }
  });
});

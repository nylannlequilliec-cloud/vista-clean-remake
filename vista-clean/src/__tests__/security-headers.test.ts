import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Security Headers Configuration", () => {
  it("includes essential HTTP security headers in next.config.ts", async () => {
    expect(nextConfig.headers).toBeDefined();

    if (nextConfig.headers) {
      const headerConfigs = await nextConfig.headers();
      expect(headerConfigs).toHaveLength(1);

      const catchAllRule = headerConfigs.find((rule) => rule.source === "/(.*)");
      expect(catchAllRule).toBeDefined();

      const headers = catchAllRule?.headers || [];
      const headerMap = new Map(headers.map((h) => [h.key, h.value]));

      expect(headerMap.get("X-Frame-Options")).toBe("DENY");
      expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(headerMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
      expect(headerMap.get("Strict-Transport-Security")).toBe(
        "max-age=63072000; includeSubDomains; preload"
      );
      expect(headerMap.get("Content-Security-Policy")).toContain("default-src 'self'");
    }
  });
});

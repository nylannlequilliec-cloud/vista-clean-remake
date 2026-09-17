import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Security Headers Configuration", () => {
  it("includes Strict-Transport-Security and other security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (nextConfig.headers) {
      const headersConfig = await nextConfig.headers();
      expect(headersConfig.length).toBeGreaterThan(0);

      const mainHeaders = headersConfig.find((h) => h.source === "/(.*)");
      expect(mainHeaders).toBeDefined();

      if (mainHeaders) {
        const headerMap = new Map(
          mainHeaders.headers.map((h) => [h.key, h.value]),
        );

        expect(headerMap.get("Strict-Transport-Security")).toBe(
          "max-age=63072000; includeSubDomains; preload",
        );
        expect(headerMap.get("X-Frame-Options")).toBe("DENY");
        expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
        expect(headerMap.get("Referrer-Policy")).toBe(
          "strict-origin-when-cross-origin",
        );
        expect(headerMap.get("Permissions-Policy")).toBe(
          "camera=(), microphone=(), geolocation=()",
        );
        expect(headerMap.has("Content-Security-Policy")).toBe(true);
      }
    }
  });
});

import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("HTTP Security Headers Configuration", () => {
  it("includes Strict-Transport-Security and other security headers", async () => {
    expect(nextConfig.headers).toBeDefined();

    if (nextConfig.headers) {
      const headersConfig = await nextConfig.headers();
      expect(headersConfig).toHaveLength(1);
      expect(headersConfig[0].source).toBe("/(.*)");

      const headerMap = new Map(
        headersConfig[0].headers.map((h) => [h.key, h.value])
      );

      expect(headerMap.get("Strict-Transport-Security")).toBe(
        "max-age=63072000; includeSubDomains; preload"
      );
      expect(headerMap.get("X-Frame-Options")).toBe("DENY");
      expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headerMap.get("Referrer-Policy")).toBe(
        "strict-origin-when-cross-origin"
      );
      expect(headerMap.get("Permissions-Policy")).toBe(
        "camera=(), microphone=(), geolocation=()"
      );
      expect(headerMap.get("Content-Security-Policy")).toBeDefined();
    }
  });
});

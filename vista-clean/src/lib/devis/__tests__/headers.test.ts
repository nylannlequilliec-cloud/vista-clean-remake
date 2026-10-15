import { describe, expect, it } from "vitest";
import nextConfig from "../../../../next.config";

describe("HTTP Security Headers Configuration", () => {
  it("includes Strict-Transport-Security (HSTS) and essential security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (nextConfig.headers) {
      const headerGroups = await nextConfig.headers();
      const catchAllGroup = headerGroups.find((group) => group.source === "/(.*)");
      expect(catchAllGroup).toBeDefined();

      const headersMap = new Map(
        catchAllGroup?.headers.map((h) => [h.key, h.value])
      );

      expect(headersMap.get("Strict-Transport-Security")).toBe(
        "max-age=63072000; includeSubDomains; preload"
      );
      expect(headersMap.get("X-Frame-Options")).toBe("DENY");
      expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(headersMap.get("Permissions-Policy")).toBeDefined();
      expect(headersMap.get("Content-Security-Policy")).toBeDefined();
    }
  });
});

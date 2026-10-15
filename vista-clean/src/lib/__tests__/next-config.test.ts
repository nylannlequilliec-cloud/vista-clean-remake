import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("next.config security headers", () => {
  it("includes all required security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(headersConfig.length).toBeGreaterThan(0);

    const mainHeaderGroup = headersConfig.find(
      (entry) => entry.source === "/(.*)"
    );
    expect(mainHeaderGroup).toBeDefined();

    const headersMap = new Map(
      mainHeaderGroup?.headers.map((h) => [h.key, h.value])
    );

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(headersMap.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
    expect(headersMap.get("X-DNS-Prefetch-Control")).toBe("on");
  });
});

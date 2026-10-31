import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("Security headers in next.config.ts", () => {
  it("configures security headers for all routes", async () => {
    expect(typeof nextConfig.headers).toBe("function");

    const headerConfigs = await nextConfig.headers!();
    expect(headerConfigs).toBeDefined();
    expect(headerConfigs.length).toBeGreaterThan(0);

    const wildcardConfig = headerConfigs.find((config) => config.source === "/(.*)");
    expect(wildcardConfig).toBeDefined();

    const headersMap = new Map(
      wildcardConfig!.headers.map((h) => [h.key, h.value])
    );

    // Verify all essential security headers are present with strong values
    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headersMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headersMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

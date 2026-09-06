import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config.ts security headers", () => {
  it("includes Strict-Transport-Security and other security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    const headersConfig = await nextConfig.headers!();
    expect(headersConfig).toHaveLength(1);
    expect(headersConfig[0].source).toBe("/(.*)");

    const headerKeys = headersConfig[0].headers.map((h) => h.key);
    expect(headerKeys).toContain("Strict-Transport-Security");
    expect(headerKeys).toContain("X-Frame-Options");
    expect(headerKeys).toContain("X-Content-Type-Options");
    expect(headerKeys).toContain("Referrer-Policy");
    expect(headerKeys).toContain("Permissions-Policy");
    expect(headerKeys).toContain("Content-Security-Policy");

    const hsts = headersConfig[0].headers.find(
      (h) => h.key === "Strict-Transport-Security"
    );
    expect(hsts?.value).toBe("max-age=63072000; includeSubDomains; preload");
  });
});

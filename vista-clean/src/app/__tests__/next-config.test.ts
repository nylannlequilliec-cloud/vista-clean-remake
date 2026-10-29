import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("next.config.ts security headers", () => {
  it("includes all required HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersList = await nextConfig.headers();
    expect(headersList.length).toBeGreaterThan(0);

    const globalHeaders = headersList.find((item) => item.source === "/(.*)");
    expect(globalHeaders).toBeDefined();
    if (!globalHeaders) return;

    const headerKeys = globalHeaders.headers.map((h) => h.key);
    expect(headerKeys).toContain("X-Frame-Options");
    expect(headerKeys).toContain("X-Content-Type-Options");
    expect(headerKeys).toContain("Referrer-Policy");
    expect(headerKeys).toContain("Permissions-Policy");
    expect(headerKeys).toContain("Strict-Transport-Security");
    expect(headerKeys).toContain("X-DNS-Prefetch-Control");

    const hsts = globalHeaders.headers.find(
      (h) => h.key === "Strict-Transport-Security"
    );
    expect(hsts?.value).toBe("max-age=63072000; includeSubDomains; preload");

    const dns = globalHeaders.headers.find(
      (h) => h.key === "X-DNS-Prefetch-Control"
    );
    expect(dns?.value).toBe("on");
  });
});

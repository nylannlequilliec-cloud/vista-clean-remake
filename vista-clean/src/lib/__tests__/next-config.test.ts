import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("next.config.ts security headers", () => {
  it("configures all required HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersList = await nextConfig.headers();
    expect(headersList.length).toBeGreaterThan(0);

    const globalHeaders = headersList.find((item) => item.source === "/(.*)");
    expect(globalHeaders).toBeDefined();

    const keys = globalHeaders?.headers.map((h) => h.key) ?? [];
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
    expect(keys).toContain("Permissions-Policy");
    expect(keys).toContain("Strict-Transport-Security");
    expect(keys).toContain("X-DNS-Prefetch-Control");
    expect(keys).toContain("Content-Security-Policy");
  });
});

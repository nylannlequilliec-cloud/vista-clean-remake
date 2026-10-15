import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("Security Headers Configuration", () => {
  it("includes Strict-Transport-Security (HSTS) and other required security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    const headerConfigs = await nextConfig.headers!();
    expect(headerConfigs.length).toBeGreaterThan(0);

    const rootConfig = headerConfigs.find((config) => config.source === "/(.*)");
    expect(rootConfig).toBeDefined();

    const headers = rootConfig!.headers;

    const hstsHeader = headers.find((h) => h.key === "Strict-Transport-Security");
    expect(hstsHeader).toBeDefined();
    expect(hstsHeader?.value).toContain("max-age=");
    expect(hstsHeader?.value).toContain("includeSubDomains");

    const xFrameHeader = headers.find((h) => h.key === "X-Frame-Options");
    expect(xFrameHeader?.value).toBe("DENY");

    const xContentTypeHeader = headers.find((h) => h.key === "X-Content-Type-Options");
    expect(xContentTypeHeader?.value).toBe("nosniff");
  });
});

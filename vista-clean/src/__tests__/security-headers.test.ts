import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("HTTP Security Headers", () => {
  it("configures Strict-Transport-Security and other security headers", async () => {
    expect(nextConfig.headers).toBeDefined();

    const headerConfigs = await nextConfig.headers!();
    expect(headerConfigs).toBeInstanceOf(Array);
    expect(headerConfigs.length).toBeGreaterThan(0);

    const globalHeaders = headerConfigs.find((config) => config.source === "/(.*)");
    expect(globalHeaders).toBeDefined();

    const headersMap = Object.fromEntries(
      globalHeaders!.headers.map((h) => [h.key, h.value]),
    );

    expect(headersMap["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headersMap["X-Frame-Options"]).toBe("DENY");
    expect(headersMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headersMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headersMap["Permissions-Policy"]).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
  });
});

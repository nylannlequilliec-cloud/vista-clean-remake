import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("HTTP Security Configuration", () => {
  it("disables poweredByHeader to avoid fingerprinting", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("configures essential defense-in-depth security headers for all routes", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    const catchAllRule = headersConfig.find((rule) => rule.source === "/(.*)");

    expect(catchAllRule).toBeDefined();
    const headersMap = Object.fromEntries(
      (catchAllRule?.headers || []).map((h) => [h.key, h.value]),
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
    expect(headersMap["X-XSS-Protection"]).toBe("1; mode=block");
  });
});

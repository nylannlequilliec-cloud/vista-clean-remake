import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Security Headers Configuration", () => {
  it("should configure HTTP security headers including Strict-Transport-Security (HSTS)", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(headersConfig).toBeInstanceOf(Array);

    const wildcardHeaderGroup = headersConfig.find(
      (entry) => entry.source === "/(.*)"
    );
    expect(wildcardHeaderGroup).toBeDefined();

    const headers = wildcardHeaderGroup?.headers || [];
    const headerMap = Object.fromEntries(
      headers.map((h) => [h.key, h.value])
    );

    expect(headerMap["X-Frame-Options"]).toBe("DENY");
    expect(headerMap["X-Content-Type-Options"]).toBe("nosniff");
    expect(headerMap["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headerMap["Permissions-Policy"]).toBe("camera=(), microphone=(), geolocation=()");
    expect(headerMap["Strict-Transport-Security"]).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
  });
});

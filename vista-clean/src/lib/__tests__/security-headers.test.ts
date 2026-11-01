import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("HTTP Security Headers", () => {
  it("defines headers configuration function", () => {
    expect(nextConfig.headers).toBeDefined();
    expect(typeof nextConfig.headers).toBe("function");
  });

  it("configures essential security headers including HSTS and X-XSS-Protection", async () => {
    const headerConfigs = await nextConfig.headers!();
    expect(headerConfigs).toHaveLength(1);

    const config = headerConfigs[0];
    expect(config.source).toBe("/(.*)");

    const headersMap = new Map<string, string>();
    for (const h of config.headers) {
      headersMap.set(h.key, h.value);
    }

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headersMap.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

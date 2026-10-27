import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config.ts security headers", () => {
  it("includes essential HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(headersConfig).toHaveLength(1);

    const headersList = headersConfig[0].headers;
    const headerMap = new Map(headersList.map((h) => [h.key, h.value]));

    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headerMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headerMap.get("X-DNS-Prefetch-Control")).toBe("on");
  });
});

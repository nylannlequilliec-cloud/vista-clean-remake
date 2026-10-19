import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("HTTP Security Headers", () => {
  it("includes essential security headers in next.config.ts", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersList = await nextConfig.headers();
    expect(headersList.length).toBeGreaterThan(0);

    const globalHeaders = headersList.find((h) => h.source === "/(.*)");
    expect(globalHeaders).toBeDefined();

    const headerMap = new Map(
      globalHeaders?.headers.map((h) => [h.key, h.value])
    );

    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headerMap.get("Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains; preload");
    expect(headerMap.get("X-XSS-Protection")).toBe("1; mode=block");
    expect(headerMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });
});

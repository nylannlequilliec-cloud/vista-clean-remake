import { describe, expect, it } from "vitest";
import nextConfig from "../../../../next.config";

describe("next.config.ts security headers", () => {
  it("defines all essential HTTP security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersList = await nextConfig.headers();
    expect(headersList.length).toBeGreaterThan(0);

    const rootConfig = headersList.find((entry) => entry.source === "/(.*)");
    expect(rootConfig).toBeDefined();

    const headersMap = new Map(
      rootConfig?.headers.map((h) => [h.key, h.value]),
    );

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headersMap.get("Permissions-Policy")).toBe("camera=(), microphone=(), geolocation=()");
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headersMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Security Headers Configuration", () => {
  it("defines comprehensive HTTP security headers for all routes", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersList = await nextConfig.headers();
    expect(headersList).toHaveLength(1);
    expect(headersList[0].source).toBe("/(.*)");

    const headersMap = new Map(
      headersList[0].headers.map((h) => [h.key, h.value])
    );

    expect(headersMap.get("X-Frame-Options")).toBe("DENY");
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headersMap.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(headersMap.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
    expect(headersMap.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
  });
});

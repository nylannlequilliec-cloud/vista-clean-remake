import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("next.config headers", () => {
  it("includes security headers including Strict-Transport-Security", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    expect(headersConfig).toHaveLength(1);
    expect(headersConfig[0].source).toBe("/(.*)");

    const headersMap = new Map(
      headersConfig[0].headers.map((h) => [h.key, h.value])
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
  });
});

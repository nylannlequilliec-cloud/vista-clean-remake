import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("Security headers and configuration", () => {
  it("disables the poweredByHeader to prevent technology disclosure", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("configures all essential HTTP security headers", async () => {
    expect(typeof nextConfig.headers).toBe("function");
    const headerConfigs = await nextConfig.headers!();

    const globalRouteConfig = headerConfigs.find(
      (entry) => entry.source === "/(.*)"
    );
    expect(globalRouteConfig).toBeDefined();

    const headersMap = new Map(
      globalRouteConfig!.headers.map((h) => [h.key, h.value])
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
  });
});

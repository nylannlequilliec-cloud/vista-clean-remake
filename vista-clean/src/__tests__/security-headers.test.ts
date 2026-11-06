import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("Security Headers Configuration", () => {
  it("defines headers for all routes with comprehensive security protections", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) {
      throw new Error("headers configuration is not defined");
    }

    const routeHeadersList = await nextConfig.headers();
    expect(routeHeadersList).toBeInstanceOf(Array);
    expect(routeHeadersList.length).toBeGreaterThan(0);

    const allRoutesConfig = routeHeadersList.find(
      (entry) => entry.source === "/(.*)"
    );
    expect(allRoutesConfig).toBeDefined();

    const headersMap = new Map(
      allRoutesConfig?.headers.map((h) => [h.key, h.value])
    );

    // Verify HSTS (Strict-Transport-Security)
    expect(headersMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload"
    );

    // Verify Clickjacking protection (X-Frame-Options)
    expect(headersMap.get("X-Frame-Options")).toBe("DENY");

    // Verify MIME sniffing prevention (X-Content-Type-Options)
    expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");

    // Verify Referrer policy
    expect(headersMap.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );

    // Verify Permissions policy
    expect(headersMap.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()"
    );

    // Verify legacy XSS protection (X-XSS-Protection)
    expect(headersMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

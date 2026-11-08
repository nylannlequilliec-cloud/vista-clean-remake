import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("HTTP Security Configuration", () => {
  it("disables X-Powered-By header to avoid framework fingerprinting", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("configures essential security headers on all routes", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (typeof nextConfig.headers !== "function") {
      throw new Error("headers must be a function");
    }

    const headersConfig = await nextConfig.headers();
    const globalRule = headersConfig.find((entry) => entry.source === "/(.*)");

    expect(globalRule).toBeDefined();
    const headerMap = new Map(
      globalRule?.headers.map((h) => [h.key, h.value]),
    );

    expect(headerMap.get("X-Frame-Options")).toBe("DENY");
    expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerMap.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=()",
    );
    expect(headerMap.get("Strict-Transport-Security")).toBe(
      "max-age=63072000; includeSubDomains; preload",
    );
    expect(headerMap.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});

import { describe, expect, it } from "vitest";
import nextConfig from "../../../../next.config";

describe("Security Headers Configuration", () => {
  it("includes Strict-Transport-Security header for all routes", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (!nextConfig.headers) return;

    const headersConfig = await nextConfig.headers();
    const globalHeaderRule = headersConfig.find((rule) => rule.source === "/(.*)");

    expect(globalHeaderRule).toBeDefined();
    const hstsHeader = globalHeaderRule?.headers.find(
      (h) => h.key === "Strict-Transport-Security"
    );

    expect(hstsHeader).toEqual({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  });
});

import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

describe("Security Headers Configuration", () => {
  it("includes Strict-Transport-Security (HSTS) header", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (nextConfig.headers) {
      const headersConfig = await nextConfig.headers();
      const globalHeaders = headersConfig.find((h) => h.source === "/(.*)");
      expect(globalHeaders).toBeDefined();

      const hstsHeader = globalHeaders?.headers.find(
        (h) => h.key === "Strict-Transport-Security"
      );
      expect(hstsHeader).toBeDefined();
      expect(hstsHeader?.value).toBe("max-age=63072000; includeSubDomains; preload");
    }
  });
});

import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

describe("next.config headers", () => {
  it("includes Strict-Transport-Security and other security headers", async () => {
    expect(nextConfig.headers).toBeDefined();
    if (nextConfig.headers) {
      const headerConfigs = await nextConfig.headers();
      const catchAllConfig = headerConfigs.find((c) => c.source === "/(.*)");
      expect(catchAllConfig).toBeDefined();

      const headers = catchAllConfig?.headers || [];
      const hstsHeader = headers.find(
        (h) => h.key === "Strict-Transport-Security"
      );

      expect(hstsHeader).toBeDefined();
      expect(hstsHeader?.value).toBe(
        "max-age=63072000; includeSubDomains; preload"
      );
    }
  });
});

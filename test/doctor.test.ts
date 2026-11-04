import { createServer } from "node:net";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import {
  checkEnvVars,
  checkNodeVersion,
  checkPort,
  formatReport,
  minimumMajor,
} from "../src/doctor.js";

describe("checkNodeVersion", () => {
  it("reads the minimum major version", () => {
    expect(minimumMajor(">=22")).toBe(22);
    expect(minimumMajor(">=22.11.0")).toBe(22);
  });

  it("passes new enough versions and explains how to fix old ones", () => {
    expect(checkNodeVersion("v22.11.0", ">=22").level).toBe("ok");
    const old = checkNodeVersion("v20.1.0", ">=22");
    expect(old.level).toBe("error");
    expect(old.fix).toContain("Node 22");
  });
});

describe("checkEnvVars", () => {
  const specs = [
    { name: "NEEDED", required: true, description: "needed" },
    { name: "EXTRA", required: false, description: "extra" },
  ];

  it("fails required, warns optional, and never echoes values", () => {
    const results = checkEnvVars(specs, { EXTRA: "test-value-should-not-appear" });
    expect(results[0]?.level).toBe("error");
    expect(results[0]?.fix).toContain("NEEDED=");
    expect(results[1]?.level).toBe("ok");
    expect(formatReport(results)).not.toContain("test-value-should-not-appear");
  });

  it("warns when an optional variable is missing", () => {
    expect(checkEnvVars(specs, { NEEDED: "x" })[1]?.level).toBe("warn");
  });
});

describe("checkPort", () => {
  it("reports a busy port with a fix", async () => {
    const server = createServer().listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address() as AddressInfo;
    const result = await checkPort(port);
    server.close();
    expect(result.level).toBe("error");
    expect(result.fix).toContain(`lsof -i :${port}`);
  });
});

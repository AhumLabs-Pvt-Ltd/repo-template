import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import { loadConfig, Secret } from "../src/config.js";

const FAKE_KEY = "test-not-a-real-key-123";

describe("Secret", () => {
  it("never shows its value when printed or serialised", () => {
    const secret = new Secret(FAKE_KEY);
    expect(String(secret)).toBe("[redacted]");
    expect(`${secret}`).toBe("[redacted]");
    expect(JSON.stringify({ secret })).toBe('{"secret":"[redacted]"}');
    expect(inspect({ secret })).not.toContain(FAKE_KEY);
  });

  it("returns the value only through reveal()", () => {
    expect(new Secret(FAKE_KEY).reveal()).toBe(FAKE_KEY);
  });
});

describe("loadConfig", () => {
  it("reads keys from the environment only", () => {
    const config = loadConfig({ ANTHROPIC_API_KEY: FAKE_KEY });
    expect(config.anthropicApiKey?.reveal()).toBe(FAKE_KEY);
    expect(config.openaiApiKey).toBeUndefined();
    expect(inspect(config)).not.toContain(FAKE_KEY);
    expect(JSON.stringify(config)).not.toContain(FAKE_KEY);
  });

  it("treats blank keys as not set", () => {
    expect(loadConfig({ OPENAI_API_KEY: "  " }).openaiApiKey).toBeUndefined();
  });

  it("defaults the port to 3000 and rejects bad ports", () => {
    expect(loadConfig({}).port).toBe(3000);
    expect(loadConfig({ PORT: "8080" }).port).toBe(8080);
    expect(() => loadConfig({ PORT: "abc" })).toThrow(/PORT/);
    expect(() => loadConfig({ PORT: "70000" })).toThrow(/PORT/);
  });
});

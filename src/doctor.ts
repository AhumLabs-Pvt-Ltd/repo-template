import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import type { EnvVarSpec } from "./config.js";

export type Level = "ok" | "warn" | "error";

export interface CheckResult {
  name: string;
  level: Level;
  message: string;
  /** How to fix the problem. Empty when level is "ok". */
  fix?: string;
}

/** Returns the minimum major version from an engines range such as ">=22" or ">=22.11.0". */
export function minimumMajor(range: string): number {
  const match = /(\d+)/.exec(range);
  if (!match?.[1]) throw new Error(`Cannot read a Node version from "${range}".`);
  return Number(match[1]);
}

export function checkNodeVersion(current: string, range: string): CheckResult {
  const required = minimumMajor(range);
  const major = Number(current.replace(/^v/, "").split(".")[0]);
  if (major >= required) {
    return { name: "Node.js", level: "ok", message: `${current} (needs ${range})` };
  }
  return {
    name: "Node.js",
    level: "error",
    message: `${current} is too old (needs ${range})`,
    fix: `Install Node ${required} or newer: https://nodejs.org, or run "nvm install ${required}".`,
  };
}

export function checkDependencies(root: string): CheckResult {
  const name = "Dependencies";
  if (!existsSync(join(root, "node_modules"))) {
    return { name, level: "error", message: "node_modules is missing", fix: 'Run "pnpm install".' };
  }
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const declared = [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ];
  const missing = declared.filter((dep) => !existsSync(join(root, "node_modules", dep)));
  if (missing.length > 0) {
    return {
      name,
      level: "error",
      message: `not installed: ${missing.join(", ")}`,
      fix: 'Run "pnpm install".',
    };
  }
  // pnpm keeps a copy of the lockfile it installed from. If they differ, the install is stale.
  const lock = join(root, "pnpm-lock.yaml");
  const installed = join(root, "node_modules", ".pnpm", "lock.yaml");
  if (existsSync(lock) && existsSync(installed)) {
    if (readFileSync(lock, "utf8") !== readFileSync(installed, "utf8")) {
      return {
        name,
        level: "error",
        message: "installed packages do not match pnpm-lock.yaml",
        fix: 'Run "pnpm install".',
      };
    }
  }
  return { name, level: "ok", message: `${declared.length} packages installed` };
}

export function checkEnvVars(specs: EnvVarSpec[], env: NodeJS.ProcessEnv): CheckResult[] {
  return specs.map((spec) => {
    const set = Boolean(env[spec.name]?.trim());
    // Never include the value in the message, only whether it is set.
    if (set) return { name: spec.name, level: "ok", message: "set" };
    return {
      name: spec.name,
      level: spec.required ? "error" : "warn",
      message: spec.required ? "required but not set" : `not set (optional). ${spec.description}`,
      fix: `Add ${spec.name}=... to your .env file (copy .env.example if you have none).`,
    };
  });
}

export function isPortFree(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, host);
  });
}

export async function checkPort(port: number): Promise<CheckResult> {
  const name = `Port ${port}`;
  if (await isPortFree(port)) return { name, level: "ok", message: "free" };
  return {
    name,
    level: "error",
    message: "already in use",
    fix: `Find the process with "lsof -i :${port}" and stop it, or set PORT to another port in .env.`,
  };
}

export function checkTool(command: string, why: string, install: string): CheckResult {
  try {
    execFileSync(command, ["version"], { stdio: "ignore" });
    return { name: command, level: "ok", message: "installed" };
  } catch {
    try {
      execFileSync(command, ["--version"], { stdio: "ignore" });
      return { name: command, level: "ok", message: "installed" };
    } catch {
      return { name: command, level: "warn", message: `not found. ${why}`, fix: install };
    }
  }
}

const SYMBOL: Record<Level, string> = { ok: "ok  ", warn: "warn", error: "FAIL" };

export function formatReport(results: CheckResult[]): string {
  const lines = results.map((r) => {
    const line = `[${SYMBOL[r.level]}] ${r.name}: ${r.message}`;
    return r.fix ? `${line}\n        fix: ${r.fix}` : line;
  });
  const errors = results.filter((r) => r.level === "error").length;
  const warnings = results.filter((r) => r.level === "warn").length;
  lines.push(
    "",
    errors === 0
      ? `All required checks passed (${warnings} warnings).`
      : `${errors} problem(s) to fix.`,
  );
  return lines.join("\n");
}

// pnpm run doctor: checks that this machine can install, test and run the project,
// and prints how to fix each problem. Exits 1 if a required check fails.
import { readFileSync } from "node:fs";
import { DEFAULT_PORT, ENV_VARS, loadEnvFile } from "../src/config.js";
import {
  checkDependencies,
  checkEnvVars,
  checkNodeVersion,
  checkPort,
  checkTool,
  formatReport,
  type CheckResult,
} from "../src/doctor.js";

loadEnvFile();

const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { engines?: { node?: string } };

const results: CheckResult[] = [
  checkNodeVersion(process.version, pkg.engines?.node ?? ">=22"),
  checkDependencies(process.cwd()),
  ...checkEnvVars(ENV_VARS, process.env),
];

const port = Number(process.env.PORT?.trim() || DEFAULT_PORT);
if (Number.isInteger(port) && port > 0 && port < 65536) {
  results.push(await checkPort(port));
} else {
  results.push({
    name: "PORT",
    level: "error",
    message: `"${process.env.PORT}" is not a valid port`,
    fix: "Set PORT to a number between 1 and 65535 in .env, or remove it.",
  });
}

results.push(
  checkTool(
    "gitleaks",
    "Needed by the pre-commit secret scan.",
    "brew install gitleaks, or see https://github.com/gitleaks/gitleaks#installing",
  ),
  checkTool(
    "pre-commit",
    "Runs gitleaks before each commit.",
    'pipx install pre-commit (or brew install pre-commit), then run "pre-commit install".',
  ),
);

console.log(formatReport(results));
process.exitCode = results.some((r) => r.level === "error") ? 1 : 0;

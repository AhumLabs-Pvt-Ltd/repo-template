// pnpm run init: one-time local setup. Creates .env from .env.example, installs the
// pre-commit secret scan hook if pre-commit is available, then runs doctor.
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync } from "node:fs";

if (existsSync(".env")) {
  console.log("[skip] .env already exists");
} else {
  copyFileSync(".env.example", ".env");
  chmodSync(".env", 0o600);
  console.log("[done] created .env from .env.example. Add your own keys there if you need them.");
}

try {
  execFileSync("pre-commit", ["install"], { stdio: "inherit" });
  console.log("[done] installed the gitleaks pre-commit hook");
} catch {
  console.log(
    '[todo] pre-commit not found. Install it (pipx install pre-commit) and run "pre-commit install".',
  );
}

console.log("");
const doctor = spawnSync("pnpm", ["run", "--silent", "doctor"], { stdio: "inherit" });
process.exitCode = doctor.status ?? 1;

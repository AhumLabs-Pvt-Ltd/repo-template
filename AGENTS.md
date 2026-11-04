# AGENTS.md

Instructions for AI coding agents working in this repository.

## Install

```sh
corepack enable          # provides the pnpm version pinned in package.json
pnpm install
pnpm run init            # creates .env from .env.example, installs hooks, runs doctor
```

Use `pnpm run init` and `pnpm run doctor`. `pnpm init` and `pnpm doctor` are different
built-in pnpm commands.

If something fails, run `pnpm run doctor` and apply the `fix:` line for each problem.

## Test

Run all of these before you finish. All must pass:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm audit
gitleaks git --redact .    # if gitleaks is installed
```

## Run

```sh
pnpm start   # HTTP server on PORT (default 3000), health check at /health
pnpm mcp     # MCP server on stdio
```

## Rules

- Never read, print, or commit the contents of `.env`. Never log API keys. Config keys are
  `Secret` objects; call `.reveal()` only where a key is passed to a provider SDK.
- Keys come from environment variables only. Do not add other ways to load them.
- New environment variables go in both `ENV_VARS` (`src/config.ts`) and `.env.example`.
- stdout belongs to the MCP transport. Log with `log()` from `src/log.ts` (stderr).
- Synthetic data only. Never add real ship, client or crew data.
- Add tests in `test/` for new behaviour.
- Plain, direct writing in docs and messages.

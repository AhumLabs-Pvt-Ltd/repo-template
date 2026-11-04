# Ahum repo template

The starting point for every Ahum tool. It gives you TypeScript on Node, pnpm, Vitest,
ESLint, Prettier, a placeholder MCP server, setup and health-check scripts, a gitleaks
pre-commit hook, and CI that runs lint, tests, a secret scan and a dependency audit.

To start a new tool, click **Use this template** on GitHub, or:

```sh
gh repo create AhumLabs-Pvt-Ltd/my-tool --template AhumLabs-Pvt-Ltd/repo-template --private --clone
```

## 10-minute quickstart

You need Git and Node.js 22 or newer. `corepack enable` gives you the right pnpm.

1. Clone and install (3 min):

   ```sh
   git clone https://github.com/AhumLabs-Pvt-Ltd/repo-template.git my-tool
   cd my-tool
   corepack enable
   pnpm install
   ```

2. Set up (2 min). This creates `.env` from `.env.example`, installs the secret scan hook
   if [pre-commit](https://pre-commit.com) is installed, and runs the doctor:

   ```sh
   pnpm run init
   ```

   Use `pnpm run init` and `pnpm run doctor`, not `pnpm init` or `pnpm doctor`. Those are
   built-in pnpm commands that do something else.

3. Fix anything the doctor flags (2 min). Each problem comes with a `fix:` line. Run it
   again any time:

   ```sh
   pnpm run doctor
   ```

4. Test (1 min):

   ```sh
   pnpm lint
   pnpm test
   ```

5. Run (2 min):

   ```sh
   pnpm start          # HTTP server, then open http://127.0.0.1:3000/health
   pnpm mcp            # placeholder MCP server on stdio
   ```

   To try the MCP server in Claude Code: `claude mcp add my-tool -- pnpm --dir "$PWD" mcp`.

## Bring your own key

Ahum tools never ship with API keys. If a feature needs a model, you supply your own key:

- Put `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` in `.env` (both are optional).
- `src/config.ts` reads them from environment variables only and wraps them in a `Secret`
  that prints as `[redacted]` in logs, JSON and `console.log`. Call `.reveal()` only where
  you pass the key to the provider's SDK.
- `.env` and `.env.*` are git-ignored, and gitleaks blocks commits that contain keys.

When you add a new variable, add it to `ENV_VARS` in `src/config.ts` (so the doctor checks
it) and to `.env.example`.

## Layout

| Path                       | What it is                                               |
| -------------------------- | -------------------------------------------------------- |
| `src/index.ts`             | Example entry point: a local HTTP server with `/health`. |
| `src/mcp/server.ts`        | Placeholder MCP server with one `ping` tool.             |
| `src/config.ts`            | Environment-only config and the `Secret` wrapper.        |
| `src/doctor.ts`            | Checks used by `pnpm run doctor`.                        |
| `scripts/init.ts`          | One-time setup.                                          |
| `test/`                    | Vitest tests.                                            |
| `.github/workflows/ci.yml` | Lint, test, secret scan, dependency audit.               |
| `.pre-commit-config.yaml`  | gitleaks hook.                                           |

## All scripts

| Command           | Does                                      |
| ----------------- | ----------------------------------------- |
| `pnpm run init`   | First-time setup                          |
| `pnpm run doctor` | Check Node, dependencies, env vars, ports |
| `pnpm start`      | Run the HTTP server                       |
| `pnpm dev`        | Run with reload on change                 |
| `pnpm mcp`        | Run the MCP server on stdio               |
| `pnpm lint`       | ESLint and Prettier check                 |
| `pnpm format`     | Fix formatting                            |
| `pnpm typecheck`  | TypeScript check                          |
| `pnpm test`       | Run tests                                 |
| `pnpm build`      | Compile to `dist/`                        |
| `pnpm audit`      | Dependency audit                          |

## Rules

Synthetic data only, no secrets in the repo. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[SECURITY.md](SECURITY.md).

## License

[Apache-2.0](LICENSE).

# Contributing

The organization-wide guide applies here:
[AhumLabs-Pvt-Ltd/.github CONTRIBUTING.md](https://github.com/AhumLabs-Pvt-Ltd/.github/blob/main/CONTRIBUTING.md).
It covers the synthetic-data rule, secrets, the Code of Conduct and the CLA.

## In this repository

```sh
corepack enable
pnpm install
pnpm run init     # sets up .env and the gitleaks pre-commit hook
```

Before you open a pull request:

```sh
pnpm lint && pnpm typecheck && pnpm test
```

Changes here affect every future Ahum tool, so keep the template small. Add features to
your own tool, not to the template, unless every tool needs them.

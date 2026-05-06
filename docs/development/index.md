# Development

Resources for contributors and maintainers.

## Documents

| File                                       | Contents                                   |
| ------------------------------------------ | ------------------------------------------ |
| [setup.md](./setup.md)                     | Local dev environment, commands, toolchain |
| [release-process.md](./release-process.md) | Versioning, changesets, npm publish        |
| [roadmap.md](./roadmap.md)                 | Planned features and known gaps            |

## Quick commands

```bash
npm run build        # tsup → dist/ (ESM + CJS + DTS)
npm test             # node:test via tsx — runs tests/**/*.test.ts
npm run check-format # prettier --check .
npm run ci           # build + format check (CI gate)
npm run format       # prettier --write .
npm run changeset    # bump version before merging a public-API change
```

## Branch model

| Branch    | Purpose                            |
| --------- | ---------------------------------- |
| `main`    | Production / npm                   |
| `develop` | Active development — open PRs here |

Branch naming: `feature/<issue>-short-name`, `bugfix/<issue>-short-name`, `chore/<issue>-short-name`.

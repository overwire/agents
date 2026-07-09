# Changelog

Notable changes to the overwire plugin and marketplace. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.2.0 — 2026-07-09

### Added

- `/overwire:guide` command: prints the installed CLI's own agent contract (`overwire agents`) — the version-matched source of truth — and degrades gracefully when the CLI is missing.
- SKILL.md "Machine-readable output" reference: the JSON error envelope (all 12 `error.kind` values) and the `run:result` envelope, both captured from real runs.
- SKILL.md "File formats" reference: inline mock-contract (with `artifacts:`/`fromFile:`) and modes-file examples, verified end to end against a demo checkout.
- Precedence rule in SKILL.md: on any disagreement, the installed CLI's guide wins over this static skill.
- CI: manifest validation (`claude plugin validate --strict`), SKILL.md frontmatter lint, markdown link check, and a drift tripwire against the product's agent guide (advisory on push/PR, authoritative on the weekly schedule).
- Manifest metadata: `$schema` pointers and `repository` URLs in both manifests.

### Fixed

- `seed-mocks --from-run` example now includes the required `--config-root .overwire` (without it the run lookup resolves a different project identity and finds nothing).
- Exit-code documentation matches the CLI: there is no "licensing" exit-2 class, validate/lint findings with errors exit 1, and signal interrupts exit 130/143.
- Demo-repo pointer describes the current `single-repo-demo/` + `multi-repo-demo/` layout and the command tour's real path.
- README no longer claims agent harnesses auto-discover `.overwire/AGENTS.md`; reference it from your repo's own `AGENTS.md` or `CLAUDE.md` instead.

## 0.1.0 — 2026-06-12

Initial release.

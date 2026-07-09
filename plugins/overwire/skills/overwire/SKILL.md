---
name: overwire
description: Use when working with GitHub Actions workflow files locally via Overwire (the local workflow workbench) — running or mocking workflows without pushing, authoring .overwire/ scenario files (modes, mock contracts, payloads, PR scenarios, rulesets, environments, chains), validating generated workflows, or reading Overwire run results. Triggers on .overwire/ directories, requests to "test this workflow locally", "mock this action", "simulate this PR/ruleset/environment", or any overwire CLI invocation.
---

# Overwire

Overwire runs, mocks, and debugs GitHub Actions workflow files locally. Its entire surface is reachable from two things you already use: **plain files** under `.overwire/` and the **`overwire` CLI**. The desktop app reads the same files, so a human can watch your work live.

## Detect and orient

- An Overwire project has a `.overwire/` directory (single repo) or a workspace root whose `.overwire/instances.yml` lists member repositories.
- If `.overwire/AGENTS.md` exists, read it — it is the version-matched contract for this machine's install. Otherwise run `overwire agents` to print it.
- No `.overwire/` yet? `overwire init` scaffolds one (`init --workspace` for multi-repo; `init --agents` also writes the guide).

## Core loop

1. **Author** workflows in `.github/workflows/` and scenarios in `.overwire/` (validate YAML against the published schemas: `overwire schema --list`, or `https://docs.overwire.io/schemas/<id>.schema.json`).
2. **Validate before running** — fix errors, heed warnings:
   ```sh
   overwire validate --config-root .overwire --json
   ```
3. **Run** with structured output and parse the final `run:result` line (outcome, exit code, per-step outcomes/modes/errors, failure stderr tails, run-record path):
   ```sh
   overwire run .github/workflows/ci.yml --config-root .overwire -e push --json
   ```
4. **Dig in only when needed**: the run record at the envelope's `recordPath` holds `run.json`, `events.jsonl`, and full logs; unmatched API calls produce ready-to-copy mock suggestions in `.overwire/state/api-mocks.suggested.yml`.
5. **Seed mocks from reality**: `overwire seed-mocks <workflow> --out .overwire/mocks --from-run <run-id> --config-root .overwire` (without `--config-root` the run lookup uses a different project identity and finds nothing).

Exit codes: 0 success/correctly-skipped, 1 run failure, 2 parse/config/validation/licensing errors.

## Rules that prevent rework

- **Never edit workflow YAML to control execution.** Step modes (`skip`/`mock`/`live`) live in `.overwire/modes/<workflow>.yml`.
- **Mock is the default and needs no Docker.** Mocked `run:` steps synthesize success with **empty outputs** — write expressions that tolerate that (`fromJSON(needs.x.outputs.y || '[]')`). Mocked `uses:` steps return their mock contract's declared outputs, and a contract's `artifacts:` block (files with inline `content:`, a `fromFile:` fixture under `.overwire/mocks/`, or neither for an empty file) registers real files in the run's artifact store — downstream `actions/download-artifact` steps restore them, and a mocked upload-artifact step synthesizes its `artifact-id`/`artifact-url`/`artifact-digest` outputs.
- **Live mode** needs a Docker-API-compatible container engine; check with `overwire doctor --json`.
- **Chains run by file path**: `overwire chain .overwire/chains/<name>.yml --config-root .overwire`. There is no `chain run <name>` form; `chain list`/`show` inspect past sessions.
- **Secrets**: declare names in `.overwire/secrets.yml`; never commit values. Logs redact secrets by default.

## Simulating platform state

Org controls are files you can author directly: repo rulesets (`rulesets.json`, GitHub's native export format), org rulesets cascading from a workspace root (`orgs/<org>/rulesets.json`), staged PRs (`pull-requests.yml`), external checks (`statuses.yml`), custom properties, protected environments (`environments/<name>/protection.yml`), declarative API mocks (`api-mocks.yml`), and saved event payloads (`payloads/<event>.json`). `overwire status --json` reports merge prediction for staged PRs against the rules.

A complete worked example: https://github.com/overwire/demo (four fictional repos, verified command tour in CLI-TEST-COMMANDS.md).

## Reference

- Full docs: https://docs.overwire.io (machine index: https://docs.overwire.io/llms.txt)
- The CLI is free end to end — no command or flag is license-gated. Pro covers desktop GUI surfaces only (multi-repo workspaces, governance simulation, and PR views). `overwire license status --json` reports the tier.

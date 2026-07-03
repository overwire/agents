# Overwire agent kit

Agent skills for [Overwire](https://overwire.io), the local workflow workbench — run, mock, and debug your GitHub Actions workflow files locally.

This repository packages the knowledge an AI coding agent needs to drive Overwire well: the file-based configuration contract, the CLI command map with structured output, and the validate–run–inspect feedback loop.

## Claude Code

Install via the plugin marketplace:

```
/plugin marketplace add overwire/agents
/plugin install overwire@overwire
```

The `overwire` skill activates when an agent works with `.overwire/` projects or is asked to test workflow files locally.

## Any other agent

Two zero-install options work everywhere:

- `overwire agents` prints the same guidance, version-matched to the installed CLI; `overwire init --agents` writes it into the project at `.overwire/AGENTS.md` where most agent harnesses will find it.
- The full documentation is published in agent-friendly form at [docs.overwire.io/llms.txt](https://docs.overwire.io/llms.txt), with JSON Schemas for every config format at [docs.overwire.io/schemas/](https://docs.overwire.io/schemas/index.json).

See [Automate Overwire with AI agents](https://docs.overwire.io/automation/ai-agents/) for the full picture, and [github.com/overwire/demo](https://github.com/overwire/demo) for a complete worked example workspace.

## License

[MIT](./LICENSE).

Overwire is compatible with GitHub Actions workflow files. Overwire is not affiliated with, endorsed by, or sponsored by GitHub, Inc. GitHub and GitHub Actions are trademarks of GitHub, Inc.

---
description: Print the installed Overwire CLI's agent contract (version-matched, beats this plugin's static skill)
allowed-tools: Bash(overwire agents:*), Bash(overwire --version:*)
---

Run `overwire agents` and show me its output.

- If the command succeeds, print the guide verbatim in a code block and note that this version-matched contract wins over the static `overwire` skill wherever they disagree.
- If `overwire` is not installed (command not found), say so and point at the install docs: https://docs.overwire.io/getting-started/installation/ — do not guess at the guide's contents from memory.

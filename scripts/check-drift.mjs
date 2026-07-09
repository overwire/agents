#!/usr/bin/env node
// Drift tripwire: SKILL.md is a hand-maintained condensation of the product
// CLI's agent guide (packages/cli/src/agent-guide.ts in the overwire
// monorepo). This script asserts a small set of sentinel facts: for each
// sentinel it (1) extracts the fact from the guide and compares its hash to
// the recorded expectation, and (2) asserts SKILL.md still states the fact.
// A hash mismatch means the guide changed — re-verify the skill's claim,
// then record the new expectation with:  node scripts/check-drift.mjs --update
//
// Guide source resolution (first hit wins):
//   1. OVERWIRE_GUIDE_SOURCE env — a file path or URL
//   2. ../overwire/packages/cli/src/agent-guide.ts (sibling dev checkout)
//   3. https://raw.githubusercontent.com/overwire/overwire/main/packages/cli/src/agent-guide.ts
//      (the monorepo is PRIVATE: works only with PRODUCT_REPO_TOKEN or
//      GITHUB_TOKEN that can read it)
// An unreachable source exits 0 with a warning so CI without credentials
// stays green — unless a token was provided (then unreachable = broken = 1).

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sentinelsPath = join(repoRoot, 'drift-sentinels.json');
const skillPath = join(repoRoot, 'plugins/overwire/skills/overwire/SKILL.md');
const RAW_URL =
  'https://raw.githubusercontent.com/overwire/overwire/main/packages/cli/src/agent-guide.ts';

const update = process.argv.includes('--update');

// Template-literal escapes in the TS source (\` and \${) would otherwise
// differ from rendered guide text; whitespace collapses so hard wraps and
// reflows don't count as drift.
function normalize(text) {
  return text.replace(/\\`/g, '`').replace(/\\\$\{/g, '${').replace(/\s+/g, ' ').trim();
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function loadGuide() {
  const explicit = process.env.OVERWIRE_GUIDE_SOURCE;
  if (explicit && !/^https?:/.test(explicit)) {
    return { text: readFileSync(explicit, 'utf8'), source: explicit };
  }
  if (!explicit) {
    const sibling = join(repoRoot, '../overwire/packages/cli/src/agent-guide.ts');
    if (existsSync(sibling)) return { text: readFileSync(sibling, 'utf8'), source: sibling };
  }
  const url = explicit ?? RAW_URL;
  const token = process.env.PRODUCT_REPO_TOKEN || process.env.GITHUB_TOKEN;
  const res = await fetch(url, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const hadToken = Boolean(token);
    const msg = `guide source unreachable: ${url} -> HTTP ${res.status}`;
    if (hadToken || process.env.DRIFT_STRICT_SOURCE === '1') {
      console.error(`✗ ${msg} (credentials were provided — treating as failure)`);
      process.exit(1);
    }
    console.warn(`⚠ ${msg}`);
    console.warn(
      '⚠ drift NOT checked. Run locally next to the overwire checkout, or set PRODUCT_REPO_TOKEN (fine-grained PAT, contents:read on overwire/overwire).',
    );
    process.exit(0);
  }
  return { text: await res.text(), source: url };
}

const { text: rawGuide, source } = await loadGuide();
const guide = normalize(rawGuide);
const skill = normalize(readFileSync(skillPath, 'utf8'));
const config = JSON.parse(readFileSync(sentinelsPath, 'utf8'));

let failed = false;
for (const s of config.sentinels) {
  const guideMatch = guide.match(new RegExp(s.guidePattern));
  if (!guideMatch) {
    console.error(
      `✗ ${s.name}: guide regex no longer matches — agent-guide.ts was restructured.\n` +
        `  Re-verify the "${s.skillSection}" claims in SKILL.md, fix the regex in drift-sentinels.json, then run with --update.`,
    );
    failed = true;
    continue;
  }
  const hash = sha256(guideMatch[0]);
  if (update) {
    s.expectedGuideSha256 = hash;
  } else if (hash !== s.expectedGuideSha256) {
    console.error(
      `✗ ${s.name}: agent-guide.ts changed since the last sync.\n` +
        `  guide now says: "${guideMatch[0]}"\n` +
        `  Re-verify the "${s.skillSection}" claims in SKILL.md (fix + bump the plugin version if needed), then run: node scripts/check-drift.mjs --update`,
    );
    failed = true;
  }
  if (!new RegExp(s.skillPattern).test(skill)) {
    console.error(
      `✗ ${s.name}: SKILL.md no longer states this fact (pattern: ${s.skillPattern}).`,
    );
    failed = true;
  }
}

if (update) {
  writeFileSync(sentinelsPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`✓ expectations recorded from ${source}`);
}
if (failed) process.exit(1);
if (!update) console.log(`✓ ${config.sentinels.length} sentinels in sync (guide: ${source})`);

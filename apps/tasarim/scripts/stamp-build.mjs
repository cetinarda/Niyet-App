#!/usr/bin/env node
// Build öncesi src/buildInfo.ts'i commit hash + tarih ile günceller.
// Netlify'da COMMIT_REF env var'i otomatik gelir; lokalde `git rev-parse`
// kullanır.

import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';

let commit = process.env.COMMIT_REF || 'dev';
if (commit === 'dev') {
  try {
    commit = execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    commit = 'unknown';
  }
} else {
  commit = commit.slice(0, 7);
}

const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
const builtAt = new Date().toISOString();

const content =
  `// AUTO-GENERATED — scripts/stamp-build.mjs tarafından her build öncesi yenilenir.\n` +
  `export const BUILD_INFO = {\n` +
  `  version: ${JSON.stringify(version)},\n` +
  `  commit: ${JSON.stringify(commit)},\n` +
  `  builtAt: ${JSON.stringify(builtAt)},\n` +
  `};\n`;

writeFileSync('src/buildInfo.ts', content);
console.log(`[stamp-build] v${version} · ${commit} · ${builtAt}`);

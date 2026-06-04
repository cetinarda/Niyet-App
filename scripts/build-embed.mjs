#!/usr/bin/env node
/**
 * Build a Sakin family embed from its monorepo source and mirror it into
 * public/embedded/<embedDir>/ — the folder the host (src/App.jsx) iframes.
 *
 * Usage:
 *   node scripts/build-embed.mjs <app>            build + sync into public/embedded/
 *   node scripts/build-embed.mjs <app> --check    build + verify the JS bundle is
 *                                                 byte-identical to what's already
 *                                                 shipped, WITHOUT touching public/
 *
 *   <app> ∈ { mitler, hayvan, tasarim }
 *
 * Pipeline (reverse-engineered from the shipped bundles; reproduces the live
 * sakinmitler bundle byte-for-byte — verified by md5):
 *   1. apps/<app>:  npx expo export --platform web   →  apps/<app>/dist/
 *   2. inject the Sakin embed scroll-override <style> just before </head>
 *      in dist/index.html
 *   3. mirror dist/ into public/embedded/<embedDir>/
 *
 * Why the injection: Expo's exported index.html (lang="en", #expo-reset reset)
 * collapses the height chain for React-Native-Web ScrollViews running inside an
 * iframe, which breaks per-screen scrolling on detail views. The override
 * restores an explicit height:100% chain. apps/<app>/web/index.html is NOT used
 * by `expo export` under the new architecture, so this post-build step is the
 * only reliable place for the fix. (Same CSS the live bundles already carry.)
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// app name → embedded/ folder the host iframes
const EMBED_DIR = {
  mitler: "sakinmitler",
  hayvan: "sakinhayvan",
  tasarim: "humandesign",
};

// Injected verbatim right before </head> in the exported index.html.
// Keep this byte-exact: it must reproduce the already-shipped index.html.
const SCROLL_OVERRIDE = `    <style>
      /* Sakin embed scroll override — keep an explicit height chain so React Native Web
         ScrollViews can scroll internally. Previous override set html/body/#root height to
         auto which collapsed the flex chain and broke per-screen scrolling on detail views. */
      html, body { overflow: hidden !important; height: 100% !important; min-height: 100% !important; -webkit-overflow-scrolling: touch; }
      #root { height: 100% !important; min-height: 100% !important; display: flex !important; flex: 1 1 auto !important; }
    </style>
  `;

function injectScrollOverride(html) {
  if (html.includes("Sakin embed scroll override")) return html; // idempotent
  const idx = html.indexOf("</head>");
  if (idx === -1) throw new Error("index.html has no </head> — cannot inject scroll override");
  return html.slice(0, idx) + SCROLL_OVERRIDE + html.slice(idx);
}

function main() {
  const app = process.argv[2];
  const check = process.argv.includes("--check");

  if (!app || !EMBED_DIR[app]) {
    console.error(`usage: node scripts/build-embed.mjs <${Object.keys(EMBED_DIR).join("|")}> [--check]`);
    process.exit(1);
  }

  const embedDir = EMBED_DIR[app];
  const appDir = path.join(ROOT, "apps", app);
  const distDir = path.join(appDir, "dist");
  const target = path.join(ROOT, "public", "embedded", embedDir);

  if (!fs.existsSync(appDir)) {
    console.error(`✗ source missing: ${appDir}`);
    process.exit(1);
  }

  // 0. install deps on first run (node_modules is gitignored, so a fresh
  //    checkout — e.g. the Mac build box — won't have them yet)
  if (!fs.existsSync(path.join(appDir, "node_modules"))) {
    console.log(`[${app}] node_modules missing — npm install …`);
    execSync("npm install", { cwd: appDir, stdio: "inherit" });
  }

  // 1. expo export
  console.log(`[${app}] expo export --platform web …`);
  execSync("npx expo export --platform web", { cwd: appDir, stdio: "inherit" });

  // 2. inject scroll override into the exported index.html
  const distIndex = path.join(distDir, "index.html");
  fs.writeFileSync(distIndex, injectScrollOverride(fs.readFileSync(distIndex, "utf8")));
  console.log(`[${app}] scroll-override injected into dist/index.html`);

  // locate the produced JS bundle (hash filename)
  const jsDir = path.join(distDir, "_expo/static/js/web");
  const bundle = fs.readdirSync(jsDir).find((f) => f.endsWith(".js"));

  if (check) {
    // regression guard: produced JS must match what's already shipped
    const shippedJsDir = path.join(target, "_expo/static/js/web");
    const shipped = fs.existsSync(shippedJsDir)
      ? fs.readdirSync(shippedJsDir).find((f) => f.endsWith(".js"))
      : null;
    if (!shipped) {
      console.error(`✗ no shipped bundle in ${shippedJsDir} to compare against`);
      process.exit(1);
    }
    const a = fs.readFileSync(path.join(jsDir, bundle));
    const b = fs.readFileSync(path.join(shippedJsDir, shipped));
    if (bundle === shipped && a.equals(b)) {
      console.log(`✓ [${app}] produced JS is byte-identical to shipped (${bundle})`);
      process.exit(0);
    }
    console.error(`✗ [${app}] produced (${bundle}) differs from shipped (${shipped})`);
    process.exit(1);
  }

  // 3. mirror dist/ → public/embedded/<embedDir>/
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(distDir, target, { recursive: true });
  console.log(`✓ [${app}] synced dist/ → public/embedded/${embedDir}/  (bundle: ${bundle})`);
}

main();

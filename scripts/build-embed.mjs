#!/usr/bin/env node
/**
 * Build a Sakin family embed from its monorepo source and (optionally) mirror it
 * into public/embedded/<embedDir>/ — the folder the host (src/App.jsx) iframes.
 *
 * Usage:
 *   node scripts/build-embed.mjs <app>            build; sync ONLY if the produced
 *                                                 JS is byte-identical to the shipped
 *                                                 bundle (red-line safe: never
 *                                                 silently replaces the live bundle)
 *   node scripts/build-embed.mjs <app> --check    build + assert byte-identical,
 *                                                 never touches public/ (exit 1 if not)
 *   node scripts/build-embed.mjs <app> --force    build + sync unconditionally
 *                                                 (use when intentionally shipping a
 *                                                 NEW bundle for <app>)
 *
 *   <app> ∈ { mitler, hayvan, tasarim }
 *
 * Pipeline (reverse-engineered from the shipped bundles):
 *   1. apps/<app>:  EXPO_BASE_URL=/embedded/<dir> npx expo export --platform web
 *   2. inject the Sakin embed scroll-override <style> just before </head>
 *      in dist/index.html
 *   3. mirror dist/ into public/embedded/<embedDir>/   (gated — see above)
 *
 * Fidelity status:
 *   - mitler : source reproduces the live bundle BYTE-IDENTICAL (md5 verified).
 *   - tasarim/hayvan : the original source drifted from GitHub and was partly lost;
 *     apps/ holds a behaviourally-identical reconstruction (same structure, strings
 *     and logic) but the minifier picks different internal variable letters, so a
 *     rebuild is NOT byte-identical to the shipped bundle. Default/--check therefore
 *     refuse to overwrite the live bundle; the shipped capture stays authoritative
 *     until you deliberately --force a new build.
 *
 * Why the scroll-override injection: Expo's exported index.html (lang="en",
 * #expo-reset reset) collapses the height chain for React-Native-Web ScrollViews
 * inside an iframe, breaking per-screen scrolling. apps/<app>/web/index.html is NOT
 * used by `expo export` under the new architecture, so this post-build step is the
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

function onlyJs(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).find((f) => f.endsWith(".js")) : null;
}

function main() {
  const app = process.argv[2];
  const check = process.argv.includes("--check");
  const force = process.argv.includes("--force");

  if (!app || !EMBED_DIR[app]) {
    console.error(`usage: node scripts/build-embed.mjs <${Object.keys(EMBED_DIR).join("|")}> [--check|--force]`);
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

  // 1. expo export (base path = the embed's mount point)
  console.log(`[${app}] expo export --platform web (base /embedded/${embedDir}) …`);
  execSync("npx expo export --platform web", {
    cwd: appDir,
    stdio: "inherit",
    env: { ...process.env, EXPO_BASE_URL: `/embedded/${embedDir}` },
  });

  // 2. inject scroll override into the exported index.html
  const distIndex = path.join(distDir, "index.html");
  fs.writeFileSync(distIndex, injectScrollOverride(fs.readFileSync(distIndex, "utf8")));
  console.log(`[${app}] scroll-override injected into dist/index.html`);

  const jsDir = path.join(distDir, "_expo/static/js/web");
  const bundle = onlyJs(jsDir);

  // compare produced JS to the currently-shipped bundle
  const shippedJsDir = path.join(target, "_expo/static/js/web");
  const shipped = onlyJs(shippedJsDir);
  const identical =
    shipped &&
    bundle === shipped &&
    fs.readFileSync(path.join(jsDir, bundle)).equals(fs.readFileSync(path.join(shippedJsDir, shipped)));

  if (check) {
    if (identical) {
      console.log(`✓ [${app}] produced JS is byte-identical to shipped (${bundle})`);
      process.exit(0);
    }
    console.error(`✗ [${app}] produced (${bundle}) differs from shipped (${shipped ?? "none"})`);
    process.exit(1);
  }

  // 3. mirror dist/ → public/embedded/<embedDir>/  (red-line gated)
  if (!identical && !force) {
    console.error(
      `✗ [${app}] rebuild is NOT byte-identical to the shipped bundle — refusing to overwrite the live embed.\n` +
        `  produced: ${bundle}\n  shipped:  ${shipped ?? "none"}\n` +
        `  The live bundle is left untouched. Re-run with --force only if you intend to ship this new build.`,
    );
    process.exit(1);
  }
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(distDir, target, { recursive: true });
  console.log(
    `✓ [${app}] synced dist/ → public/embedded/${embedDir}/  (bundle: ${bundle}${identical ? ", byte-identical" : ", FORCED new build"})`,
  );
}

main();

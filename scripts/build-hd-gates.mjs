#!/usr/bin/env node
// HUMAN DESIGN KAPI VERİSİ ÜRETECİ
// ---------------------------------------------------------------------------
// apps/tasarim/src/data/gates.ts içindeki 64 kapıyı host'un kullanabileceği
// JSON'a çevirir. ELLE KOPYALAMA YOK: Tasarım uygulaması güncellenince bu
// script tekrar çalıştırılır ve iki taraf aynı metni gösterir.
//
// Kaynak TypeScript ama runtime bağımlılığı yok (tek import bir TİP).
// O yüzden import satırı ve tip ek açıklamaları temizlenip nesne
// değerlendiriliyor; ayrı bir TS derleyicisine gerek kalmıyor.
//
// ÇIKTI: src/hd-gates.json  (küçük, ~14 KB; ana bundle'a girmesi sorun değil)
// Çalıştır: node scripts/build-hd-gates.mjs [--check]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "apps/tasarim/src/data/gates.ts");
const OUT = path.join(ROOT, "src/hd-gates.json");
const CHECK = process.argv.includes("--check");

let ts;
try { ts = fs.readFileSync(SRC, "utf8"); }
catch { console.error(`[hd-gates] KAYNAK YOK: ${SRC}`); process.exit(1); }

// `export const GATES: Record<number, GateInfo> = { ... };` gövdesini al.
const m = ts.match(/export const GATES[^=]*=\s*(\{[\s\S]*?\n\});/);
if (!m) { console.error("[hd-gates] GATES nesnesi bulunamadi (kaynak degismis olabilir)"); process.exit(1); }

let obj;
try {
  // Nesne saf veri: sayı, string ve anahtarlar. Fonksiyon/çağrı içermiyor,
  // bu yüzden değerlendirmek güvenli. Yine de yalnızca eşleşen gövde kullanılır.
  obj = new Function(`"use strict"; return (${m[1]});`)();
} catch (e) {
  console.error("[hd-gates] nesne degerlendirilemedi:", e.message);
  process.exit(1);
}

const nums = Object.keys(obj).map(Number).sort((a, b) => a - b);
const missing = [];
for (let i = 1; i <= 64; i++) if (!nums.includes(i)) missing.push(i);

// Host'un ihtiyacı olan alanlar. `center` kapı hangi merkezde, günlük vurguda
// "hangi alanın uyarıldığı" bilgisini veriyor.
const out = {};
for (const n of nums) {
  const g = obj[n];
  out[n] = {
    n: g.name, nEn: g.nameEn || g.name,
    c: g.center,
    t: g.theme, tEn: g.themeEn || g.theme,
    g: g.gift, gEn: g.giftEn || g.gift,
    s: g.shadow, sEn: g.shadowEn || g.shadow,
  };
}

const json = JSON.stringify(out);
console.log(`[hd-gates] ${nums.length}/64 kapi, ${Math.round(json.length / 1024)} KB`);
if (missing.length) { console.error("[hd-gates] EKSIK KAPI:", missing.join(",")); process.exit(1); }
if (!CHECK) { fs.writeFileSync(OUT, json); console.log("[hd-gates] yazildi -> src/hd-gates.json"); }
else console.log("[hd-gates] KONTROL (dosya yazilmadi)");

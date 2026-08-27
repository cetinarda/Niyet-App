#!/usr/bin/env node
// HUMAN DESIGN NATAL VERİSİ ÜRETECİ (kanallar + tip/otorite/profil etiketleri)
// ---------------------------------------------------------------------------
// NEDEN: "Ben" ekranı temel HD bilgisini (tip, strateji, otorite, profil)
// gösteriyor. Bu bilgi Tasarım uygulamasında hesaplanıyor ama uygulamanın
// localStorage'ına YAZILMIYOR (@tasarim_profiles yalnızca ad/doğum/şehir
// tutar), yani günlük kartlarda işe yarayan "embed'in verisini oku" yöntemi
// burada uygulanamıyor. Host kendisi hesaplamak zorunda.
//
// ELLE KOPYALAMA YOK: kanal tablosu ve etiketler apps/tasarim kaynağından
// üretiliyor, tıpkı scripts/build-hd-gates.mjs gibi. Tasarım güncellenince
// bu script tekrar çalıştırılır ve iki taraf aynı şeyi söyler.
//
// Tasarım bundle'ı YENİDEN DERLENMİYOR (CLAUDE.md kırmızı çizgisi: build:tasarim
// byte-identical değil). Yalnızca kaynak dosyalar OKUNUYOR.
//
// ÇIKTI: src/hd-natal.json  (~6 KB)
// Çalıştır: node scripts/build-hd-natal.mjs [--check]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "apps/tasarim/src/data");
const OUT = path.join(ROOT, "src/hd-natal.json");
const CHECK = process.argv.includes("--check");

function read(file) {
  const p = path.join(DATA, file);
  try { return fs.readFileSync(p, "utf8"); }
  catch { console.error(`[hd-natal] KAYNAK YOK: ${p}`); process.exit(1); }
}

// TS kaynağından saf veri nesnesini/dizisini çıkar. Dosyalar yalnızca literal
// veri içeriyor (fonksiyon/çağrı yok), bu yüzden eşleşen gövdeyi
// değerlendirmek güvenli; yine de SADECE eşleşen gövde kullanılıyor.
function extract(src, decl, open, close) {
  const re = new RegExp(`export const ${decl}[^=]*=\\s*(\\${open}[\\s\\S]*?\\n\\${close});`);
  const m = src.match(re);
  if (!m) { console.error(`[hd-natal] ${decl} bulunamadi (kaynak degismis olabilir)`); process.exit(1); }
  try { return new Function(`"use strict"; return (${m[1]});`)(); }
  catch (e) { console.error(`[hd-natal] ${decl} degerlendirilemedi:`, e.message); process.exit(1); }
}

const CHANNELS = extract(read("channels.ts"), "CHANNELS", "[", "]");
const TYPES = extract(read("types.ts"), "TYPES", "{", "}");
const AUTHORITIES = extract(read("authorities.ts"), "AUTHORITIES", "{", "}");
const PROFILES = extract(read("profiles.ts"), "PROFILES", "{", "}");

// ── Kanallar: hesaplama için yalnızca kapı çifti + iki uç merkez gerekli.
// Ad/açıklama/devre alanları host'ta kullanılmıyor, bundle'ı şişirmesin.
const channels = CHANNELS.map((c) => ({ g: c.gates, c: c.centers }));

// ── Tip: ad + strateji + imza + yanlış frekans (temel düzey, kullanıcı isteği).
const types = {};
for (const [key, t] of Object.entries(TYPES)) {
  types[key] = {
    e: t.emoji || "",
    n: t.type, nEn: t.nameEn || t.type,
    s: t.strategy, sEn: t.strategyEn || t.strategy,
    g: t.signature, gEn: t.signatureEn || t.signature,
    x: t.notSelf, xEn: t.notSelfEn || t.notSelf,
  };
}

// ── Otorite ve profil: yalnızca görünen ad.
const pickName = (o) => ({ n: o.name || o.title || "", nEn: o.nameEn || o.titleEn || o.name || o.title || "" });
const authorities = {};
for (const [k, a] of Object.entries(AUTHORITIES)) authorities[k] = pickName(a);
const profiles = {};
for (const [k, p] of Object.entries(PROFILES)) profiles[k] = pickName(p);

const out = { channels, types, authorities, profiles };
const json = JSON.stringify(out);

if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur === json) { console.log("[hd-natal] guncel"); process.exit(0); }
  console.error("[hd-natal] FARKLI: src/hd-natal.json yeniden uretilmeli");
  process.exit(1);
}

fs.writeFileSync(OUT, json);
console.log(`[hd-natal] ${channels.length} kanal · ${Object.keys(types).length} tip · ` +
            `${Object.keys(authorities).length} otorite · ${Object.keys(profiles).length} profil ` +
            `-> src/hd-natal.json (${(json.length / 1024).toFixed(1)} KB)`);

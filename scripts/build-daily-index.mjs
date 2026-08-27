#!/usr/bin/env node
// GÜNÜN KARTLARI İÇERİK İNDEKSİ ÜRETECİ
// ---------------------------------------------------------------------------
// NEDEN VAR: "Bugün" ekranı, embed uygulamaların (Hayvan/Bitkiler/Taşlar/Mitler)
// o gün çektiği kartı host tarafında GÖSTERMEK zorunda.
//
// KÖKLÜ ÇÖZÜM (postMessage köprüsü YERİNE):
//   1) DURUM: embed'ler host ile AYNI ORIGIN'de (sakin.life/embedded/...).
//      localStorage origin bazlıdır, path bazlı değil; yani host zaten
//      `@sakinhayvan_daily` gibi anahtarları DOĞRUDAN okuyabiliyor.
//      Ölçüldü: embed açılınca anahtarlar host penceresinde belirdi.
//      Köprü kurmaya, embed'leri yeniden derlemeye gerek yok.
//   2) İÇERİK: `_daily` yalnızca ID tutuyor (ör. {"animalId":"a086"}).
//      Adı/emojisi embed'in veri tablosunda. Bu script o tabloları
//      monorepo kaynağından okuyup host'un çözebileceği KOMPAKT bir indekse
//      indirger. Elle kopyalama YOK, yani içerik tek kaynakta kalır ve
//      uygulamalar güncellenince bu script tekrar çalıştırılır.
//
// ⚠️ TUZAK: Hayvan uygulamasının `_daily` nesnesi `stoneId` ve `nagualId` de
// taşır ama İKİSİ DE HAYVAN ID'sidir. Kaynak: HomeScreen.tsx içinde
// `generateDailyReading(qIds, aIds, aIds, aIds)` çağrılıyor, yani taş/nagual
// dizileri yerine hayvan dizisi geçiliyor. Bu yüzden günün TAŞI için
// `@sakintaslar_daily`, günün BİTKİSİ için `@sakinbitkiler_daily` okunmalı;
// hayvan uygulamasının stoneId'si kullanılmamalı (yanlış kart gösterir).
//
// ÇIKTI: public/daily-index/<lang>.json  (host çalışma anında fetch eder)
// Ana bundle'a gömülmez; sadece Bugün ekranı açılınca ilgili dil indirilir.
//
// Çalıştır: node scripts/build-daily-index.mjs [--check]
//   --check : dosyaları YAZMAZ, yalnızca üretilebilir mi ve boyutu ne kadar
//             olur onu raporlar (CI/doğrulama için).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPS = path.join(ROOT, "apps");
const OUT_DIR = path.join(ROOT, "public", "daily-index");
const LANGS = ["tr", "en", "de", "es", "fr", "ja", "pt"];
const CHECK = process.argv.includes("--check");

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}
// Veri dosyaları ya düz dizi ya da { anahtar: [...] } sarmalı olabiliyor.
function toArray(j) {
  if (!j) return null;
  if (Array.isArray(j)) return j;
  const arr = Object.values(j).find((v) => Array.isArray(v));
  return arr || null;
}
// Kartta gösterilecek MİNİMUM alanlar. Uzun anlatı metinleri BİLEREK alınmıyor:
// Bugün ekranı bir özet, tam metin için kullanıcı uygulamaya gidiyor.
function slim(o) {
  if (!o || !o.id) return null;
  const kw = o.keywords || o.symbolism || o.properties || null;
  const out = { n: o.name };
  if (o.emoji) out.e = o.emoji;
  if (o.color) out.c = o.color;
  if (o.element) out.el = o.element;
  if (Array.isArray(kw) && kw.length) out.k = kw.slice(0, 3);
  // Kısa günlük mesaj varsa al (naguals/stones bunu taşıyor).
  const msg = o.dailyMessage || o.guidance || null;
  if (typeof msg === "string" && msg.length <= 240) out.m = msg;
  return out;
}

// Kaynak tanımı: hedef anahtar -> { dosya, dile göre sonek var mı }
// `i18n:true` olanlar mitler tarafında dil başına ayrı dosya tutuyor
// (archetypes_de.json gibi); diğerleri tek dilli (Türkçe kaynak).
const SOURCES = {
  animal:    { file: path.join(APPS, "hayvan/src/data/animals.json"),   i18n: false },
  nagual:    { file: path.join(APPS, "hayvan/src/data/naguals.json"),   i18n: false },
  plant:     { file: path.join(APPS, "bitkiler/src/data/plants.json"),  i18n: false },
  stone:     { file: path.join(APPS, "taslar/src/data/stones.json"),    i18n: false },
  archetype: { file: path.join(APPS, "mitler/src/data/archetypes.json"), i18n: true },
  myth:      { file: path.join(APPS, "mitler/src/data/myths.json"),      i18n: true },
  tarot:     { file: path.join(APPS, "mitler/src/data/tarot.json"),      i18n: true },
  rune:      { file: path.join(APPS, "mitler/src/data/runes.json"),      i18n: true },
  iching:    { file: path.join(APPS, "mitler/src/data/iching.json"),     i18n: true },
  image:     { file: path.join(APPS, "mitler/src/data/images.json"),     i18n: true },
};

// Tek dilli kaynaklarda name/nameEn/nameDe... kalıbı var (bitkiler böyle).
const LANG_FIELD = { en: "nameEn", de: "nameDe", es: "nameEs", fr: "nameFr", ja: "nameJa", pt: "namePt" };

function localize(o, lang) {
  const s = slim(o);
  if (!s) return null;
  if (lang !== "tr") {
    const f = LANG_FIELD[lang];
    if (f && o[f]) s.n = o[f];
  }
  return s;
}

function pathForLang(src, lang) {
  if (!src.i18n) return src.file;
  if (lang === "tr") return src.file;                    // tr = eksiz dosya
  return src.file.replace(/\.json$/, `_${lang}.json`);
}

let hadError = false;
const report = [];

for (const lang of LANGS) {
  const bundle = {};
  for (const [key, src] of Object.entries(SOURCES)) {
    const p = pathForLang(src, lang);
    const arr = toArray(readJson(p)) || (src.i18n ? toArray(readJson(src.file)) : null);
    if (!arr) {
      console.error(`[daily-index] KAYNAK OKUNAMADI: ${key} (${lang}) -> ${p}`);
      hadError = true;
      continue;
    }
    const map = {};
    for (const o of arr) {
      const s = localize(o, lang);
      if (s) map[o.id] = s;
    }
    bundle[key] = map;
  }
  const json = JSON.stringify(bundle);
  report.push({ lang, kb: Math.round(json.length / 1024), keys: Object.keys(bundle).length });
  if (!CHECK) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), json);
  }
}

console.log(CHECK ? "[daily-index] KONTROL (dosya yazilmadi)" : `[daily-index] yazildi -> public/daily-index/`);
for (const r of report) console.log(`  ${r.lang}: ${r.kb} KB, ${r.keys} kaynak`);
if (hadError) { console.error("[daily-index] EN AZ BIR KAYNAK OKUNAMADI"); process.exit(1); }

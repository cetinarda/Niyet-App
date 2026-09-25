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

// Tek dosyalı kaynaklarda (hayvan/nagual/bitki/taş) HER alanın dil kopyası
// aynı nesnede, sonekli: name/nameEn/nameDe..., element/elementEn...,
// symbolism/symbolismEn..., properties/propertiesEn..., dailyMessage/
// dailyMessageEn..., guidance/guidanceEn...
// ⚠️ Eskiden yalnızca `name` çevriliyordu: tr dışındaki 6 dilde element,
// anahtar kelimeler ve günlük mesaj TÜRKÇE kalıyordu (dil başına ~500 metin).
// Kural: istenen dil -> yoksa İngilizce -> Türkçe YALNIZCA tr için. Tek istisna
// ad (`n`): hiç çevirisi yoksa özel isim sayılıp Türkçe ad kalır, kart adsız
// kalmasın. Diğer alanlarda çeviri yoksa alan hiç yazılmaz (Türkçe sızmaz).
const SUFFIX = { en: "En", de: "De", es: "Es", fr: "Fr", ja: "Ja", pt: "Pt" };
const KW_FIELDS = ["keywords", "symbolism", "properties"];

function has(v) {
  return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "";
}
// `base` alanının `lang` karşılığı: dil -> en -> (yalnızca tr ise) Türkçe.
function pick(o, base, lang) {
  if (lang === "tr") return o[base];
  const own = o[base + SUFFIX[lang]];
  if (has(own)) return own;
  const en = o[base + "En"];
  if (has(en)) return en;
  return undefined;
}

// Kaynaklar element adının harf büyüklüğünde tutarsız (hayvan "luft"/"aire",
// taş "Luft"/"Aire"). Kartta anahtar kelimelerle yan yana yazıldığı için tek
// biçime çekilir: Almancada isim büyük harfle, diğerlerinde küçük (tr gibi).
function normElement(s, lang) {
  if (typeof s !== "string" || !s) return s;
  if (lang === "de") return s.charAt(0).toLocaleUpperCase("de") + s.slice(1);
  if (lang === "ja") return s;
  return s.charAt(0).toLocaleLowerCase(lang) + s.slice(1);
}

// Sonekli alan taşıyan (tek dosyalı) kaynaklar için yerelleştirilmiş kopya.
// Çıktı şeması slim() ile BİREBİR aynı (n/e/c/el/k/m); yalnızca değerler değişir.
function localizedView(o, lang) {
  const v = { ...o };
  const n = pick(o, "name", lang);
  v.name = has(n) ? n : o.name;
  v.element = normElement(pick(o, "element", lang), lang);
  // Anahtar kelime alanı kaynağa göre değişiyor; slim() ile aynı önceliği koru.
  const kwBase = KW_FIELDS.find((f) => has(o[f]));
  for (const f of KW_FIELDS) v[f] = undefined;
  if (kwBase) v[kwBase] = pick(o, kwBase, lang);
  // Mesaj slim()'e verilmez, localize() ayrıca karar veriyor (aşağıya bak).
  v.dailyMessage = undefined;
  v.guidance = undefined;
  return v;
}

// Çeviriler Türkçeden uzun olabiliyor (bitki mesajları de/es/fr/pt'de 300'e
// kadar). 240 sınırı dile göre uygulanırsa `m` bazı dillerde düşüyordu. Bu
// yüzden `m` olup olmayacağına TÜRKÇE kaynak karar verir (şema her dilde
// aynı), çeviri için daha geniş bir emniyet tavanı kullanılır.
const MSG_MAX_LOCALIZED = 360;

function localize(o, lang, src) {
  // i18n:true kaynaklarda (mitler) dil başına ayrı dosya var, alanlar zaten
  // o dilde; sonekli alan aranmaz.
  if (lang === "tr" || src.i18n) return slim(o);
  const s = slim(localizedView(o, lang));
  if (!s) return null;
  const trMsg = slim(o)?.m;
  if (trMsg !== undefined) {
    // Türkçede hangi alan seçildiyse (dailyMessage || guidance) onun karşılığı.
    const base = has(o.dailyMessage) ? "dailyMessage" : "guidance";
    const msg = pick(o, base, lang);
    if (typeof msg === "string" && msg.length <= MSG_MAX_LOCALIZED) s.m = msg;
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
      const s = localize(o, lang, src);
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

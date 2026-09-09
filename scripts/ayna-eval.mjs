#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// İÇSEL AYNA REGRESYON KONTROLÜ
//
// NE YAPAR: scripts/ayna-cases.json içindeki gerçek vakaları canlı ai-call
// fonksiyonuna gönderir, cevapları basar ve bilinen kırmızı bayrakları
// (geçmişte yaşanmış hatalara ait ifadeler, ham derece değeri, çekingen dil)
// otomatik işaretler. Karar SENDE: bu bir puanlama aracı değil, gözle okuman
// için düzenli bir çıktı üretir.
//
// NEDEN VAR: prompt değişiklikleri sessizce geriye düşebiliyor. Bir hatayı
// düzeltirken eskisini geri getirdiğimizi ancak kullanıcı fark ettiğinde
// öğreniyorduk (bkz. CLAUDE.md "İçsel Ayna: sürekli zekâ geliştirme").
//
// KULLANIM:
//   node scripts/ayna-eval.mjs                 # canlı siteye sorar
//   node scripts/ayna-eval.mjs --base http://localhost:8888
//   node scripts/ayna-eval.mjs --case olumlu-uyku
//
// NOT: Bu script İSTEMCİ prompt'unu birebir kurmaz (o App.jsx içinde, React
// state'ine bağlı). Sadeleştirilmiş bir sistem prompt'u ile modelin TEMEL
// eğilimini ölçer: soruyu doğru yönde okuyor mu, ham veri sızdırıyor mu,
// uydurma yapıyor mu. Tam davranış için uygulamada elle de dene.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argOf = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const BASE = argOf("--base", "https://sakin.life");
const ONLY = argOf("--case", null);

const data = JSON.parse(readFileSync(join(__dir, "ayna-cases.json"), "utf8"));
const cases = data.cases.filter((c) => !ONLY || c.id === ONLY);
if (cases.length === 0) {
  console.error(`Vaka bulunamadi: ${ONLY}`);
  process.exit(1);
}

// Sadelestirilmis sistem prompt'u: App.jsx'teki kurallarin OZU.
const SYSTEM = `Sen derin bir ayna ve enerji rehberisin. YALNIZCA Türkçe yaz. "Sen" diye hitap et.
Asla tıbbi tavsiye verme, teşhis koyma.
Dil tonu: dürüst, samimi, doğrudan. Şiir yazmıyorsun, cevap veriyorsun. Dolgu cümle kurma.
SORUNUN YÖNÜNÜ DOĞRU OKU: anlatılan deneyim zorlayıcı, olumlu ya da sadece merak kaynaklı olabilir. Önce bunu ayırt et. Olumlu veya nötr bir gözlemi sorun gibi ele alma, olmayan bir şikayete çare önerme; neden böyle olabileceğini açıkla. Yön gerçekten belirsizse tek bir kısa netleştirme sorusu sor.
HAM SAYI YAZMA: derece, ondalık, koordinat gibi ham değerleri cevaba koyma. Veriyi ancak anlamına çevirerek kullan.
Sana verilmeyen bir tarih, kapı numarası ya da gezegen konumu UYDURMA.
UZUN ÇİZGİ KULLANMA.`;

// Her cevapta aranan genel kirmizi bayraklar (vakaya ozel olanlar dosyada).
const GENEL_BAYRAK = [
  { re: /\d+[.,]\d+\s*(derece|°)?/i, not: "ham ondalık sayı (yorumlanmamış veri olabilir)" },
  { re: /—|–|―/, not: "uzun çizgi (yasak)" },
  { re: /\b(belki|muhtemelen|olabilir ki|sanırım)\b/i, not: "çekingen dil" },
];

async function sor(c) {
  const res = await fetch(`${BASE}/.netlify/functions/ai-call`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      lang: "tr",
      max_tokens: 900,
      system: SYSTEM,
      messages: [{ role: "user", content: `Kullanıcının sorusu: "${c.soru}"\n\nKısa ve doğrudan cevap ver.` }],
    }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || d.error) throw new Error(`${res.status} ${d?.error || ""}`);
  return String(d.text || "").trim();
}

let hata = 0;
for (const c of cases) {
  console.log("\n" + "=".repeat(72));
  console.log(`VAKA: ${c.id}`);
  console.log(`SORU: ${c.soru}`);
  if (c.gecmis_hata) console.log(`GECMIS HATA: ${c.gecmis_hata}`);
  console.log(`BEKLENEN: ${c.beklenen}`);
  console.log("-".repeat(72));
  let cevap;
  try {
    cevap = await sor(c);
  } catch (e) {
    console.log(`  ISTEK BASARISIZ: ${e.message}`);
    hata++;
    continue;
  }
  console.log(cevap);
  console.log("-".repeat(72));

  const bulgular = [];
  for (const b of GENEL_BAYRAK) if (b.re.test(cevap)) bulgular.push(b.not);
  for (const kb of c.kirmizi_bayrak || []) {
    if (cevap.toLocaleLowerCase("tr").includes(String(kb).toLocaleLowerCase("tr"))) {
      bulgular.push(`vakaya özel bayrak: "${kb}"`);
    }
  }
  if (bulgular.length) {
    hata++;
    console.log("  ⚠ BAYRAK:");
    for (const b of bulgular) console.log(`     - ${b}`);
    console.log("  (bayrak = kesin hata değil, GÖZLE doğrula)");
  } else {
    console.log("  bayrak yok");
  }
}

console.log("\n" + "=".repeat(72));
console.log(`${cases.length} vaka calisti, ${hata} tanesinde bayrak/hata var.`);
console.log("Cevaplari GOZLE oku: bayrak yoksa da yanlis yonde okuma olabilir.");

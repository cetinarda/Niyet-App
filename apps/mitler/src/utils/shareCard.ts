// Zarif, sade paylaşım kartı, söz/içerik kartını 1080×1350 (4:5) görsele çevirir,
// sonra native paylaşım (Instagram vb.) açar; desteklenmiyorsa indirir. Web-only
// (embed'ler webview'de çalışır). Sakin koyu estetiği + tek accent renk.

export interface ShareCardSpec {
  appName: string;    // üst kicker, ör. "SAKİN TAŞLAR"
  accent: string;     // hex vurgu rengi
  emoji?: string;     // büyük sembol/emoji (imageUrl yoksa / yüklenemezse yedek)
  imageUrl?: string;  // gerçek portre foto (taş/hayvan/bitki), emoji yerine çizilir
  title?: string;     // ad (taş/hayvan/bitki): söz kartında boş
  meta?: string;      // element · çakra vb.
  body?: string;      // günün mesajı
  quote?: string;     // söz metni / rehberlik
  quoteBy?: string;   // kaynak
  cta?: string;       // alt CTA satırı (ör. "Daha fazlası için sakin.life")
  fileName?: string;
  shareText?: string;
}

// Türkçe-duyarlı büyük harf: JS toUpperCase 'i'→'I' yapar (yanlış: "SAKIN").
// Türkçe'de i→İ, ı→I olmalı ("SAKİN HAYVAN").
function trUpper(s: string): string {
  return String(s || '').replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
}

// Portre fotoğrafını yükler (CORS anonim → canvas'a çizilebilsin). Başarısızsa null.
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    } catch (_) { resolve(null); }
  });
}

// Tainted canvas'ta toBlob SecurityError atar → null döndürüp emoji yedeğine düşeriz.
function toBlobSafe(cv: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    try { cv.toBlob((b) => resolve(b), 'image/png', 0.95); }
    catch (_) { resolve(null); }
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = String(text || '').split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

// Metni cümle sınırında özetler (kart "özet gibi" kısa kalsın). maxChars'ı aşarsa
// en yakın cümle bitişine (. ! ? …) kadar keser; bulamazsa kelime sınırında + "…".
function summarize(text: string, maxChars: number): string {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= maxChars) return t;
  const slice = t.slice(0, maxChars);
  const m = slice.match(/[\s\S]*[.!?…](\s|$)/);
  if (m && m[0].trim().length >= maxChars * 0.5) return m[0].trim();
  const sp = slice.lastIndexOf(' ');
  return (sp > 0 ? slice.slice(0, sp) : slice).trim() + '…';
}

// Satır dizisini n satıra indirir; son tutulan satırı "…" ile bitirir.
function ellipsize(lines: string[], n: number): string[] {
  if (n >= lines.length) return lines;
  if (n <= 0) return [];
  const kept = lines.slice(0, n);
  let last = kept[n - 1].replace(/[\s.,;:-]+$/, '');
  if (!last.endsWith('…')) last += '…';
  kept[n - 1] = last;
  return kept;
}

// Belirli fontla ölçüp satırlara böler (dikey ortalama ön-hesabı için).
function wrap0(ctx: CanvasRenderingContext2D, text: string, maxW: number, font: string): string[] {
  const prev = ctx.font; ctx.font = font;
  const lines = wrap(ctx, text, maxW);
  ctx.font = prev;
  return lines;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function isShareable(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

export async function shareCard(spec: ShareCardSpec): Promise<void> {
  if (!isShareable()) return;
  const W = 1080, H = 1350;
  const [ar, ag, ab] = hexToRgb(spec.accent || '#C9A84C');

  // Gerçek portre fotoğrafını önden yükle (varsa). Emoji yalnızca yedek.
  const portrait = spec.imageUrl ? await loadImage(spec.imageUrl) : null;

  // Kartı çizer. usePortrait=false → foto tainted çıktıysa (CORS) emoji yedeğiyle
  // tekrar çizmek için. Dönen canvas toBlob'a verilir.
  const render = (usePortrait: boolean): HTMLCanvasElement | null => {
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    if (!ctx) return null;
    const useImg = usePortrait && !!portrait;
    const IMG_D = 232; // portre çapı

    // Arka plan gradyanı
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0D0B14');
    bg.addColorStop(0.5, '#160f26');
    bg.addColorStop(1, '#0A0812');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // hafif accent parıltısı (üstte)
    const glow = ctx.createRadialGradient(W / 2, 300, 40, W / 2, 300, 620);
    glow.addColorStop(0, `rgba(${ar},${ag},${ab},0.13)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    // yıldızlar
    const stars = [[70, 120, 2.5], [260, 90, 1.6], [900, 140, 2.4], [990, 360, 1.8], [120, 500, 1.6], [960, 640, 2], [90, 900, 1.8], [980, 980, 2.4], [200, 1180, 1.6], [880, 1220, 2]];
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const [x, y, r] of stars) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
    // ince çerçeve
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.28)`;
    ctx.lineWidth = 2;
    roundRect(ctx, 48, 48, W - 96, H - 96, 28); ctx.stroke();

    ctx.textAlign = 'center';

    // Üst kicker
    ctx.fillStyle = `rgba(${ar},${ag},${ab},0.92)`;
    ctx.font = "600 26px -apple-system, 'Helvetica Neue', Arial, sans-serif";
    ctx.fillText(spaceOut(trUpper(spec.appName || '')), W / 2, 150);

    // İçerik bloğunu ölç. ÖNCE metni özetle (cümle sınırında kısalt), kartlar sade,
    // "özet gibi" kalsın; SONRA yine taşarsa satır kırparak "…" ile bitir → HİÇ kesilmez.
    const zoneTop = 240, zoneBot = H - 210;
    const BODY_LH = 50, QUOTE_LH = 56, TITLE_LH = 74;
    const artH = useImg ? IMG_D + 40 : (spec.emoji ? 148 : 0);
    const titleLines = spec.title ? wrap0(ctx, spec.title, W - 260, "300 62px 'Georgia', serif") : [];
    let bodyLines = spec.body ? wrap0(ctx, summarize(spec.body, spec.quote ? 260 : 460), W - 220, "300 34px -apple-system, Arial, sans-serif") : [];
    let quoteLines = spec.quote ? wrap0(ctx, '“' + summarize(spec.quote, 180) + '”', W - 220, "italic 300 38px 'Georgia', serif") : [];

    const fixedH = artH + (titleLines.length ? titleLines.length * TITLE_LH + 6 : 0) + (spec.meta ? 56 : 0);
    const quoteFixed = quoteLines.length ? 44 + (spec.quoteBy ? 46 : 0) : 0;
    const avail = (zoneBot - zoneTop) - fixedH;
    // Gövde için bütçe (quote'a öncelik: quote genelde kısa/vurucu). Taşarsa gövdeyi kırp.
    const bodyBudget = avail - (quoteLines.length ? quoteFixed + quoteLines.length * QUOTE_LH : 0) - (bodyLines.length ? 18 : 0);
    const maxBodyLines = Math.max(0, Math.floor(bodyBudget / BODY_LH));
    if (bodyLines.length > maxBodyLines) bodyLines = ellipsize(bodyLines, maxBodyLines);
    // Gövde yoksa/kısaldıysa quote hâlâ taşıyorsa quote'u da kırp.
    const quoteBudget = avail - (bodyLines.length ? bodyLines.length * BODY_LH + 18 : 0) - quoteFixed;
    const maxQuoteLines = Math.max(0, Math.floor(quoteBudget / QUOTE_LH));
    if (quoteLines.length > maxQuoteLines) quoteLines = ellipsize(quoteLines, maxQuoteLines);

    let blockH = fixedH;
    if (bodyLines.length) blockH += bodyLines.length * BODY_LH + 18;
    if (quoteLines.length) blockH += quoteFixed + quoteLines.length * QUOTE_LH;
    let y = Math.max(zoneTop + 60, zoneTop + (zoneBot - zoneTop - blockH) / 2 + 60);

    if (useImg && portrait) {
      // Gerçek portre: daire kırpma + accent halka (emoji yerine).
      const d = IMG_D, cx = W / 2, cy = y - 20 + d / 2;
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      const iw = portrait.width || d, ih = portrait.height || d;
      const scale = Math.max(d / iw, d / ih); // cover-fit
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(portrait, cx - dw / 2, cy - dh / 2, dw, dh);
      ctx.restore();
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.6)`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2); ctx.stroke();
      y += d + 34; // portre ile başlık binmesin (62px serif ascender payı)
    } else if (spec.emoji) {
      ctx.font = "120px -apple-system, 'Apple Color Emoji', 'Helvetica Neue', sans-serif";
      ctx.fillStyle = '#fff';
      ctx.fillText(spec.emoji, W / 2, y);
      y += 110;
    }
    if (titleLines.length) {
      ctx.fillStyle = '#F3EEFB';
      ctx.font = "300 62px 'Georgia', 'Times New Roman', serif";
      for (const ln of titleLines) { ctx.fillText(ln, W / 2, y); y += 74; }
      y += 6;
    }
    if (spec.meta) {
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.85)`;
      ctx.font = "400 24px -apple-system, 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText(spaceOut(trUpper(spec.meta)), W / 2, y);
      y += 56;
    }
    if (bodyLines.length) {
      ctx.fillStyle = 'rgba(226,220,240,0.92)';
      ctx.font = "300 34px -apple-system, 'Helvetica Neue', Arial, sans-serif";
      for (const ln of bodyLines) { ctx.fillText(ln, W / 2, y); y += 50; }
      y += 18;
    }
    if (quoteLines.length) {
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.5)`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(W / 2 - 44, y); ctx.lineTo(W / 2 + 44, y); ctx.stroke();
      y += 44;
      ctx.fillStyle = '#EFE9DA';
      ctx.font = "italic 300 38px 'Georgia', 'Times New Roman', serif";
      for (const ln of quoteLines) { ctx.fillText(ln, W / 2, y); y += 56; }
      if (spec.quoteBy) {
        y += 10;
        ctx.fillStyle = `rgba(${ar},${ag},${ab},0.9)`;
        ctx.font = "400 26px -apple-system, 'Helvetica Neue', Arial, sans-serif";
        ctx.fillText(', ' + spec.quoteBy, W / 2, y);
      }
    }

    // Alt marka: ✦ ayraç + TEK satır. CTA metni zaten "sakin.life" içerir, 
    // ayrıca footer yazılmaz (çift "sakin.life" + yıldızın yazıya binmesi bug'ıydı).
    ctx.fillStyle = `rgba(${ar},${ag},${ab},0.8)`;
    ctx.font = '22px serif';
    ctx.fillText('✦', W / 2, H - 138);
    if (spec.cta) {
      ctx.fillStyle = `rgba(${ar},${ag},${ab},0.85)`;
      ctx.font = "400 24px -apple-system, 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText(spec.cta, W / 2, H - 96);
    } else {
      ctx.fillStyle = 'rgba(160,150,180,0.7)';
      ctx.font = "300 24px -apple-system, 'Helvetica Neue', Arial, sans-serif";
      ctx.fillText(spaceOut('sakin.life'), W / 2, H - 96);
    }
    return cv;
  };

  const fileName = spec.fileName || 'sakin.png';
  let cv = render(true);
  let blob = cv ? await toBlobSafe(cv) : null;
  // Foto CORS yüzünden canvas'ı tainted yaptıysa toBlob null döner → emojiyle tekrar çiz.
  if (!blob && portrait) { cv = render(false); blob = cv ? await toBlobSafe(cv) : null; }
  if (!blob) return;

  // Android host (iframe) içinde: WebView navigator.share(files) ve blob indirmeyi
  // desteklemez → görseli host'a köprüle; host Capacitor Share ile paylaşır. iOS embed
  // (WKWebView) ve standalone web navigator.share ile devam eder (aşağıda).
  const inIframe = (() => { try { return !!window.parent && window.parent !== window; } catch { return true; } })();
  const isAndroid = /android/i.test((typeof navigator !== 'undefined' && navigator.userAgent) || '');
  if (inIframe && isAndroid && cv) {
    try {
      const dataUrl = cv.toDataURL('image/png');
      window.parent.postMessage({ type: 'sakin-share-card', dataUrl, fileName }, '*');
      return;
    } catch (_) { /* köprü başarısız → web yoluna düş */ }
  }

  try {
    const file = new File([blob], fileName, { type: 'image/png' });
    const nav: any = navigator;
    if (nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], text: spec.shareText || '' });
      return;
    }
  } catch (e: any) {
    // Kullanıcı paylaşım sayfasını "Vazgeç" ile kapattıysa (AbortError) HİÇBİR ŞEY
    // yapma. Eskiden bu durumda da aşağıdaki indirme fallback'ine düşülüyordu, 
    // kullanıcı açıkça "hayır" demişken sessizce bir blob: URL indirme denemesi
    // (<a download> click) tetiklemek hem yanlış davranış hem de WKWebView'de
    // paylaşım sayfası kapanışının hemen ardından İKİNCİ bir native geçiş/navigasyon
    // denemesi anlamına geliyordu: "paylaştan dönünce zoom takılması" hatasının
    // muhtemel bir bileşeni buydu.
    if (e && e.name === 'AbortError') return;
    // gerçek hata (kullanıcı iptal etmedi, paylaşım başka nedenle başarısız oldu)
  }
  // Fallback: indir: yalnızca GERÇEK hata durumunda buraya gelinir, iptalde değil.
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  } catch (_) { /* sessiz */ }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function spaceOut(s: string): string {
  // hafif harf aralığı hissi (canvas letterSpacing her yerde yok)
  return s.split('').join(' ');
}

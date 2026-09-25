/* Sitedeki "Sakin'le bir gün" bölümünün ekran görüntülerini üretir.
   Uygulamanın web sürümünü (dist/) örnek bir kullanıcıyla açar, saati sabaha
   sabitler, 4 ekranı (sabah, kart, nefes, mektup) 390x844 @2x çeker.
   Kullanım (repo kökünde):
     npm run build
     (cd dist && python3 -m http.server 4791 &)
     # Google Fonts css + woff2 dosyalarını <FONTS_DIR>'e indir (all.css + gstatic yolu '_' ile)
     for L in tr en de es pt fr ja; do mkdir -p /tmp/shots/$L; node scripts/site-shots.cjs <FONTS_PARENT> $L /tmp/shots/$L; done
     # sonra PNG -> WebP: public/home/shots/<dil>/<ekran>.webp (genişlik 540)
   Port: PORT ortam değişkeni (varsayılan 4791). */
const puppeteer = require('/home/user/Niyet-App/node_modules/puppeteer');
const fs = require('fs'), path = require('path');
const SP = process.argv[2], lang = process.argv[3] || 'tr';
const FD = SP + '/fonts'; // <FONTS_PARENT>/fonts
(async () => {
  const b = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const p = await (await b.createBrowserContext()).newPage();
  await p.setRequestInterception(true);
  p.on('request', r => {
    const u = r.url();
    if (u.startsWith('https://fonts.googleapis.com/')) return r.respond({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'text/css', body: fs.readFileSync(FD + '/all.css', 'utf8') });
    if (u.startsWith('https://fonts.gstatic.com/')) { const f = FD + '/' + u.replace('https://fonts.gstatic.com/', '').replace(/\//g, '_'); if (fs.existsSync(f)) return r.respond({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'font/woff2', body: fs.readFileSync(f) }); }
    if (!u.startsWith('http://localhost')) return r.abort();
    r.continue();
  });
  p.on('pageerror', e => console.log('ERR', String(e).slice(0, 160)));
  await p.evaluateOnNewDocument(() => {
    const RD = Date; const base = new RD(); base.setHours(8, 42, 0, 0); const off = base.getTime() - RD.now();
    class FD extends RD { constructor(...a) { if (a.length) super(...a); else super(RD.now() + off); } static now() { return RD.now() + off; } }
    window.Date = FD;
  });
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await p.goto('http://localhost:'+(process.env.PORT||4791)+'/index.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate((lang) => {
    const d = new Date(); const dk = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const name = { tr:'Deniz', en:'Mira', de:'Lena', es:'Lucía', pt:'Inês', fr:'Léa', ja:'Yui' }[lang];
    const set = { sakin_lang: lang, sakin_birth_date: '1990-06-14', sakin_birth_time: '08:20', sakin_birth_city: 'İstanbul', sakin_name: name,
      sakin_hazirim_today: dk, sakin_open_count: '12', sakin_onb_baglan: '1', sakin_onb_kesfet: '1', sakin_nedir_off: '1', sakin_bugun_hint: '1',
      sakin_last_seen_version: '1.4.2', sakin_analytics_off: '1', sakin_notif_asked: '1',
      sakin_niyet_letter: JSON.stringify({ text: 'x', created: Date.now() - 8*864e5, opensAt: Date.now() + 13*864e5 }) };
    for (const [k,v] of Object.entries(set)) localStorage.setItem(k, v);
  }, lang);
  await p.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4500));
  await p.evaluate(() => document.fonts.ready);
  const OUT = process.argv[4];
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const hideNav = () => p.evaluate(() => { for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if ((cs.position === 'fixed' || cs.position === 'sticky') && r.top < 4 && r.height < 120 && /FİYAT|PRICING|PREIS|PRECIO|PREÇO|PRIX|TARIF|料金|価格/i.test(el.innerText||'')) el.style.display = 'none'; } });
  const clickBtn = (fnSrc) => p.evaluate((src) => { const f = new Function('bs', src); const bs = [...document.querySelectorAll('button')]; const b = f(bs); if (b) { b.click(); return (b.innerText||'').slice(0,40); } return null; }, fnSrc);
  const scrollEl = (sel, off) => p.evaluate((sel, off) => {
    const el = new Function(sel)(); if (!el) return false;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    let a = el.parentElement; while (a && !(/(auto|scroll)/.test(getComputedStyle(a).overflowY) && a.scrollHeight > a.clientHeight)) a = a.parentElement;
    (a || window).scrollBy({ top: -off, behavior: 'instant' }); return true; }, sel, off);
  const tabs = () => p.evaluate(() => { const bs = [...document.querySelectorAll('button')]; return bs.slice(-5).map(b => b.innerText.trim()); });
  await hideNav(); await p.evaluate(() => window.scrollTo(0, 0)); await wait(400);
  await p.screenshot({ path: `${OUT}/sabah.png` });
  // tarot: "Bir kart seç" kartı = üst tarot bölümündeki tek kapalı kart butonu (metni değişken; alt-başlık uzun)
  const tr = await clickBtn("return bs.find(b => b.querySelector('img[src*=\"back.webp\"]')) || bs.find(b => /Bir kart seç|Pick a card|Wähle eine Karte|Elige una carta|Escolhe uma carta|Choisis une carte|カードを/i.test(b.innerText));");
  console.log(lang, 'tarot', tr); await wait(3200);
  console.log('tarot scroll', await scrollEl("return [...document.querySelectorAll('img')].find(i => /\\/tarot\\/tr_/.test(i.src) && i.getBoundingClientRect().height > 150);", 190));
  await wait(700); await hideNav();
  await p.screenshot({ path: `${OUT}/kart.png` });
  // ben -> mektup
  const t = await tabs(); await clickBtn("return bs[bs.length-1];"); await wait(2500); await hideNav();
  console.log('letter scroll', await scrollEl("return [...document.querySelectorAll('svg')].find(s => { const w = s.getBoundingClientRect().width; return w > 150 && w < 260 && s.querySelector('radialGradient, linearGradient'); });", 260));
  await wait(800); await hideNav();
  await p.screenshot({ path: `${OUT}/mektup.png` });
  // bağlan -> nefes -> diyafram -> başla
  await clickBtn("return bs[bs.length-3];"); await wait(2200);
  await clickBtn("const i = bs.findIndex(b => /^(SABAH|MORNING)/i.test(b.innerText.trim())); return i >= 0 ? bs[i+2] : bs.find(b=>/NEFES|BREATH|ATEM|RESPIR|SOUFFLE|呼吸/i.test(b.innerText));"); await wait(2200);
  await clickBtn("return bs.find(b => b.innerText.trim().startsWith('◡'));"); await wait(500);
  await clickBtn("const i = bs.findIndex(b => b.innerText.trim().startsWith('←')); return bs[i+1];"); await wait(2600); await hideNav();
  await p.evaluate(() => window.scrollTo(0, 0)); await wait(300);
  await p.screenshot({ path: `${OUT}/nefes.png` });
  await b.close();
})();

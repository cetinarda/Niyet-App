import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html><head><style>
* { margin:0; padding:0; }
body { width:1024px; height:1024px; overflow:hidden; background:#060a12; display:flex; align-items:center; justify-content:center; }
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#0e1220"/>
      <stop offset="100%" stop-color="#060a12"/>
    </radialGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(200,185,225,0.95)"/>
      <stop offset="60%" stop-color="rgba(160,140,200,0.7)"/>
      <stop offset="100%" stop-color="rgba(122,80,150,0.0)"/>
    </radialGradient>
    <radialGradient id="aura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(184,164,216,0.12)"/>
      <stop offset="70%" stop-color="rgba(122,80,150,0.04)"/>
      <stop offset="100%" stop-color="rgba(122,80,150,0.0)"/>
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="36" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="outerGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="380" fill="url(#aura)"/>

  <rect x="220" y="220" width="584" height="584" rx="52"
        fill="none" stroke="rgba(184,164,216,0.28)" stroke-width="1.5"
        transform="rotate(45 512 512)"/>
  <rect x="220" y="220" width="584" height="584" rx="52"
        fill="none" stroke="rgba(184,164,216,0.08)" stroke-width="8"
        transform="rotate(45 512 512)"
        filter="url(#outerGlow)"/>

  <circle cx="512" cy="512" r="240" fill="none" stroke="rgba(184,164,216,0.06)" stroke-width="0.8"/>
  <circle cx="512" cy="512" r="180" fill="none" stroke="rgba(184,164,216,0.08)" stroke-width="0.8"/>
  <circle cx="512" cy="512" r="120" fill="none" stroke="rgba(184,164,216,0.10)" stroke-width="0.8"/>

  <circle cx="512" cy="512" r="110" fill="url(#centerGlow)" opacity="0.3" filter="url(#softGlow)"/>
  <circle cx="512" cy="512" r="44" fill="rgba(200,185,225,0.9)"/>
  <circle cx="512" cy="512" r="44" fill="rgba(184,164,216,0.6)" filter="url(#softGlow)"/>
  <circle cx="500" cy="500" r="14" fill="rgba(255,255,255,0.15)"/>
</svg>
</body></html>`;

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });

const outputPath = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png');
await page.screenshot({ path: outputPath, type: 'png', clip: { x: 0, y: 0, width: 1024, height: 1024 } });
console.log('App icon saved:', outputPath);
await browser.close();

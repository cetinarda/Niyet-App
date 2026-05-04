import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html><head><style>
* { margin:0; padding:0; }
body { width:1024px; height:1024px; overflow:hidden; background:#080c14; display:flex; align-items:center; justify-content:center; }
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="1024" height="1024">
  <rect width="32" height="32" rx="6" fill="#080c14"/>
  <rect x="5" y="5" width="22" height="22" rx="2"
        fill="none"
        stroke="rgba(184,164,216,0.55)"
        stroke-width="1.2"
        transform="rotate(45 16 16)"/>
  <rect x="9" y="9" width="14" height="14" rx="1.5"
        fill="none"
        stroke="rgba(184,164,216,0.3)"
        stroke-width="1"
        transform="rotate(45 16 16)"/>
  <circle cx="16" cy="16" r="2.8"
          fill="rgba(184,164,216,0.9)"
          filter="url(#glow)"/>
  <circle cx="16" cy="16" r="5"
          fill="rgba(122,80,150,0.25)"/>
  <defs>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
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

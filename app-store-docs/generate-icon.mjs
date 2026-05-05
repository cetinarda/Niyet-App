import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html><head><style>
* { margin:0; padding:0; }
body { width:1024px; height:1024px; overflow:hidden; background:#080c14; display:flex; align-items:center; justify-content:center; }
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <rect width="1024" height="1024" fill="#080c14"/>
  <rect x="160" y="160" width="704" height="704" rx="64"
        fill="none" stroke="rgba(184,164,216,0.55)" stroke-width="38"
        transform="rotate(45 512 512)"/>
  <rect x="288" y="288" width="448" height="448" rx="48"
        fill="none" stroke="rgba(184,164,216,0.3)" stroke-width="32"
        transform="rotate(45 512 512)"/>
  <circle cx="512" cy="512" r="160" fill="rgba(122,80,150,0.25)"/>
  <circle cx="512" cy="512" r="90" fill="rgba(184,164,216,0.9)"/>
  <circle cx="512" cy="512" r="90" fill="rgba(184,164,216,0.5)" filter="url(#glow)"/>
  <defs>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="48" result="blur"/>
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

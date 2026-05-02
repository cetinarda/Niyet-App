import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1242, height: 2688, deviceScaleFactor: 1 });

const filePath = path.join(__dirname, 'aksam-screenshot.html');
await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

await page.screenshot({
  path: path.join(__dirname, 'aksam-1242x2688.png'),
  type: 'png',
  clip: { x: 0, y: 0, width: 1242, height: 2688 }
});

console.log('Screenshot saved: aksam-1242x2688.png');
await browser.close();

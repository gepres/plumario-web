// Genera public/og.png desde la portada real, con cinco stickers ya pegados.
// Uso: con el sitio corriendo, node scripts/make-og.mjs [url]
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv[2] ?? 'http://127.0.0.1:4329/';
const pasted = ['phoenicopterus-chilensis', 'pelecanus-thagus', 'spheniscus-humboldti', 'larosterna-inca', 'vultur-gryphus'];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2, colorScheme: 'light' });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
for (const id of pasted) {
  await page.locator(`.tray [data-sticker="${id}"]`).click();
  await page.waitForTimeout(800);
}
await page.addStyleTag({ content: '.site-header__nav,.site-header__actions,.hero-status,.spread .button{display:none!important}' });
await page.waitForTimeout(500);
const image = await page.screenshot({ type: 'png' });
await browser.close();

await sharp(image).resize(1200, 630).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(join(ROOT, 'public', 'og.png'));
console.log('public/og.png listo');

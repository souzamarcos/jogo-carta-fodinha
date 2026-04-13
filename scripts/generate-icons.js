import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body {
    background: #1e293b;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  span { line-height: 1; }
</style>
</head>
<body><span id="icon">🃏</span></body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);

// 192x192
await page.setViewportSize({ width: 192, height: 192 });
await page.locator('#icon').evaluate(el => el.style.fontSize = '140px');
const buf192 = await page.screenshot({ type: 'png' });
writeFileSync(resolve(__dirname, '../public/icon-192.png'), buf192);
console.log('Generated icon-192.png');

// 512x512
await page.setViewportSize({ width: 512, height: 512 });
await page.locator('#icon').evaluate(el => el.style.fontSize = '380px');
const buf512 = await page.screenshot({ type: 'png' });
writeFileSync(resolve(__dirname, '../public/icon-512.png'), buf512);
console.log('Generated icon-512.png');

await browser.close();
console.log('Icons generated successfully!');

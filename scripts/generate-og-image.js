import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2040 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    position: relative;
  }

  /* Decorative card shapes in the background */
  .bg-card {
    position: absolute;
    font-size: 160px;
    opacity: 0.08;
    user-select: none;
    font-family: Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif;
  }
  .bg-card-1 { top: -30px; left: -20px; transform: rotate(-20deg); }
  .bg-card-2 { top: -20px; right: 30px; transform: rotate(15deg); }
  .bg-card-3 { bottom: -40px; left: 40px; transform: rotate(10deg); }
  .bg-card-4 { bottom: -30px; right: -10px; transform: rotate(-15deg); }

  /* Main content */
  .cards-row {
    display: flex;
    gap: 16px;
    margin-bottom: 36px;
  }
  .card {
    width: 72px;
    height: 100px;
    background: #ffffff;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 800;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    color: #1e293b;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .card.red { color: #dc2626; }
  .card.highlight {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: #1e293b;
    transform: translateY(-8px) rotate(-3deg);
    box-shadow: 0 12px 32px rgba(245,158,11,0.5);
  }

  .title {
    font-size: 96px;
    font-weight: 900;
    color: #f1f5f9;
    letter-spacing: -2px;
    line-height: 1;
    margin-bottom: 16px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .title span {
    color: #f59e0b;
  }

  .subtitle {
    font-size: 28px;
    color: #94a3b8;
    letter-spacing: 4px;
    text-transform: uppercase;
    font-weight: 500;
  }

  .divider {
    width: 120px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #f59e0b, transparent);
    margin: 20px 0;
  }
</style>
</head>
<body>
  <!-- Background decorative cards -->
  <span class="bg-card bg-card-1">🂡</span>
  <span class="bg-card bg-card-2">🂮</span>
  <span class="bg-card bg-card-3">🃁</span>
  <span class="bg-card bg-card-4">🃍</span>

  <!-- Card row visual -->
  <div class="cards-row">
    <div class="card red">7</div>
    <div class="card">K</div>
    <div class="card highlight">3</div>
    <div class="card red">A</div>
    <div class="card">J</div>
  </div>

  <!-- Title -->
  <div class="title">F<span>o</span>dinha</div>

  <div class="divider"></div>

  <!-- Subtitle -->
  <div class="subtitle">Jogo de Cartas Online</div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(html, { waitUntil: 'networkidle' });

const buf = await page.screenshot({ type: 'png' });
writeFileSync(resolve(__dirname, '../public/og-image.png'), buf);
console.log('Generated og-image.png (1200×630)');

await browser.close();

import { test, expect } from '@playwright/test';

test.describe('SEO — Social sharing meta tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('Fodinha – Jogo de Cartas Online');
  });

  test('has meta description', async ({ page }) => {
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /Auxiliar digital/);
  });

  test('has og:title', async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', 'Fodinha – Jogo de Cartas Online');
  });

  test('has og:description', async ({ page }) => {
    const ogDescription = page.locator('meta[property="og:description"]');
    const content = await ogDescription.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(0);
  });

  test('has og:image with absolute URL', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]');
    const content = await ogImage.getAttribute('content');
    expect(content).toMatch(/^https?:\/\//);
  });

  test('has og:url pointing to canonical', async ({ page }) => {
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /jogo-carta-fodinha/);
  });

  test('has og:locale set to pt_BR', async ({ page }) => {
    const ogLocale = page.locator('meta[property="og:locale"]');
    await expect(ogLocale).toHaveAttribute('content', 'pt_BR');
  });

  test('has twitter:card summary_large_image', async ({ page }) => {
    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');
  });

  test('has canonical link', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /jogo-carta-fodinha/);
  });

  test('og:image and twitter:image point to same URL', async ({ page }) => {
    const ogImage = page.locator('meta[property="og:image"]');
    const twitterImage = page.locator('meta[name="twitter:image"]');
    const ogContent = await ogImage.getAttribute('content');
    const twitterContent = await twitterImage.getAttribute('content');
    expect(ogContent).toBe(twitterContent);
  });
});

test.describe('SEO — Crawler files', () => {
  // Files in public/ are served under the Vite base path (/jogo-carta-fodinha/)
  const BASE = '/jogo-carta-fodinha';

  test('robots.txt is accessible and valid', async ({ request }) => {
    const response = await request.get(`${BASE}/robots.txt`);
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Sitemap:');
    expect(text).toContain('sitemap.xml');
  });

  test('sitemap.xml is accessible and valid', async ({ request }) => {
    const response = await request.get(`${BASE}/sitemap.xml`);
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('<urlset');
    expect(text).toContain('jogo-carta-fodinha');
  });
});

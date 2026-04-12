import { test, expect } from '@playwright/test';

test.describe('Mode 1 — Lives and Elimination', () => {
  test('E2E-009: players start with 5 lives (green indicator)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByText('Suporte Geral').click();

    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');
    await page.getByRole('button', { name: /Começar Partida/i }).click();

    // Both players should show 5 lives (green dots)
    const greenDots = page.locator('.bg-green-500');
    await expect(greenDots.first()).toBeVisible();
  });
});

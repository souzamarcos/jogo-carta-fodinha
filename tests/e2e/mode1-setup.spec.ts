import { test, expect } from '@playwright/test';

test.describe('Mode 1 — Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('E2E-002: home page shows both mode buttons', async ({ page }) => {
    await expect(page.getByText('Suporte Geral')).toBeVisible();
    await expect(page.getByText('Painel Individual')).toBeVisible();
  });

  test('E2E-002: navigates to game setup on Mode 1 click', async ({ page }) => {
    await page.getByText('Suporte Geral').click();
    await expect(page).toHaveURL('/game/setup');
    await expect(page.getByText('Nova Partida')).toBeVisible();
  });

  test('E2E-002: start button disabled with less than 2 named players', async ({ page }) => {
    await page.goto('/game/setup');
    const startButton = page.getByRole('button', { name: /Começar Partida/i });
    await expect(startButton).toBeDisabled();
  });

  test('E2E-002: can add players and start game', async ({ page }) => {
    await page.goto('/game/setup');

    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('Bob');

    const startButton = page.getByRole('button', { name: /Começar Partida/i });
    await expect(startButton).toBeEnabled();
    await startButton.click();

    await expect(page).toHaveURL('/game/round');
  });

  test('E2E-008: duplicate player names are rejected', async ({ page }) => {
    await page.goto('/game/setup');

    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Alice');
    await inputs.nth(1).fill('alice'); // same name, different case

    await page.getByRole('button', { name: /Começar Partida/i }).click();

    await expect(page.getByText(/duplicad/i)).toBeVisible();
    await expect(page).toHaveURL('/game/setup');
  });
});

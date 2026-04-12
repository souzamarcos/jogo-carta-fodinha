import { test, expect } from '@playwright/test';

test.describe('Mode 2 — Player Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('E2E-011: Mode 2 setup flow', async ({ page }) => {
    await page.getByText('Painel Individual').click();
    await expect(page).toHaveURL('/player');

    // Config screen
    await expect(page.getByText('Painel Individual')).toBeVisible();

    const nameInput = page.locator('input[type="text"]');
    await nameInput.fill('João');

    await page.getByRole('button', { name: /Iniciar/i }).click();

    // Etapa 1: Select manilha
    await expect(page.getByText(/Qual é a manilha/i)).toBeVisible();

    // Select value
    await page.locator('button').filter({ hasText: 'A' }).first().click();
    // Select suit
    await page.getByText(/Paus/i).first().click();
    await page.getByRole('button', { name: /Confirmar Manilha/i }).click();

    // Etapa 2: Build hand
    await expect(page.getByText(/Sua mão/i)).toBeVisible();

    // Add a card
    await page.locator('button').filter({ hasText: 'K' }).first().click();

    // Iniciar Rodada
    await page.getByRole('button', { name: /Iniciar Rodada/i }).click();

    // Play screen
    await expect(page.getByText(/Minha mão/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Finalizar Rodada/i })).toBeVisible();
  });

  test('E2E-012: Mode 2 finish round advances to next round', async ({ page }) => {
    // Setup Mode 2
    await page.getByText('Painel Individual').click();
    await page.locator('input[type="text"]').fill('Maria');
    await page.getByRole('button', { name: /Iniciar/i }).click();

    // Set manilha
    await page.locator('button').filter({ hasText: 'Q' }).first().click();
    await page.getByText(/Copas/i).first().click();
    await page.getByRole('button', { name: /Confirmar Manilha/i }).click();

    // Add card and start
    await page.locator('button').filter({ hasText: '7' }).first().click();
    await page.getByRole('button', { name: /Iniciar Rodada/i }).click();

    // Verify play screen and finish
    await expect(page.getByText('Finalizar Rodada')).toBeVisible();
    await page.getByRole('button', { name: /Finalizar Rodada/i }).click();

    // Should return to manilha setup (Etapa 1) for round 2
    await expect(page.getByText(/Qual é a manilha/i)).toBeVisible();
  });
});

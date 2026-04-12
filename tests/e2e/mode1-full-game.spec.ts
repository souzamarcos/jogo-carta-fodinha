import { test, expect } from '@playwright/test';

test.describe('Mode 1 — Full Game Flow', () => {
  async function setupGame(page: any, playerNames = ['Alice', 'Bob', 'Carol']) {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByText('Suporte Geral').click();
    await expect(page).toHaveURL('/game/setup');

    const inputs = page.locator('input[type="text"]');
    for (let i = 0; i < playerNames.length; i++) {
      if (i >= 2) {
        await page.getByRole('button', { name: /Adicionar jogador/i }).click();
      }
      await inputs.nth(i).fill(playerNames[i]);
    }

    await page.getByRole('button', { name: /Começar Partida/i }).click();
    await expect(page).toHaveURL('/game/round');
  }

  test('E2E-001: full round cycle — bid, play, result', async ({ page }) => {
    await setupGame(page);

    // Should be on bid phase
    await expect(page.getByText(/Rodada 1/i)).toBeVisible();

    // Select manilha value
    await page.locator('button').filter({ hasText: '7' }).first().click();
    // Select suit
    await page.getByText(/Ouros/i).first().click();

    // All bids default to 0, "Iniciar Rodada" should be enabled
    const startBtn = page.getByRole('button', { name: /Iniciar Rodada/i });
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    // Now in playing phase
    await expect(page.getByRole('button', { name: /Finalizar Rodada/i })).toBeVisible();
    await page.getByRole('button', { name: /Finalizar Rodada/i }).click();

    // Now in result phase
    await expect(page.getByText(/Resultado/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar Resultado/i }).click();

    // Confirmation modal
    await expect(page.getByText(/Confirmar/i)).toBeVisible();
    await page.getByRole('button', { name: /Confirmar/i }).last().click();

    // Should advance to round 2 (bid phase again)
    await expect(page.getByText(/Rodada 2/i)).toBeVisible();
  });

  test('E2E-007: game state persists after page reload', async ({ page }) => {
    await setupGame(page);

    // Select manilha and start round
    await page.locator('button').filter({ hasText: 'K' }).first().click();
    await page.getByText(/Copas/i).first().click();
    await page.getByRole('button', { name: /Iniciar Rodada/i }).click();

    // Reload the page
    await page.reload();

    // Should still be on playing phase
    await expect(page.getByRole('button', { name: /Finalizar Rodada/i })).toBeVisible();
  });

  test('E2E-013: round history accordion is collapsed by default', async ({ page }) => {
    await setupGame(page);

    // Select manilha and complete a round
    await page.locator('button').filter({ hasText: '5' }).first().click();
    await page.getByText(/Espadas/i).first().click();
    await page.getByRole('button', { name: /Iniciar Rodada/i }).click();
    await page.getByRole('button', { name: /Finalizar Rodada/i }).click();
    await page.getByRole('button', { name: /Confirmar Resultado/i }).click();
    await page.getByRole('button', { name: /Confirmar/i }).last().click();

    // On round 2, history exists but should be collapsed
    const historyBtn = page.getByText(/Histórico/i);
    await expect(historyBtn).toBeVisible();
    // Table should NOT be visible (collapsed)
    await expect(page.locator('table')).not.toBeVisible();

    // Click to expand
    await historyBtn.click();
    await expect(page.locator('table')).toBeVisible();
  });
});

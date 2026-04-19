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

  test('E2E-033: adjusting player count on Etapa 1 updates display and allows manilha confirmation', async ({ page }) => {
    // Start a Mode 2 session (default 4 players)
    await page.getByText('Painel Individual').click();
    await page.locator('input[type="text"]').fill('Alice');
    await page.getByRole('button', { name: /Iniciar/i }).click();

    // Etapa 1 is now visible
    await expect(page.getByText(/Qual é a manilha/i)).toBeVisible();

    // The stepper should show the initial player count (4)
    await expect(page.getByText('4').first()).toBeVisible();

    // Tap − to reduce player count to 3
    await page.getByRole('button', { name: '−' }).click();

    // Count display should update to 3
    await expect(page.locator('.font-mono').filter({ hasText: '3' })).toBeVisible();

    // Select a manilha value and confirm — should succeed with updated count
    await page.locator('button').filter({ hasText: 'K' }).first().click();
    await page.getByRole('button', { name: /Confirmar Manilha/i }).click();

    // Etapa 2 (hand setup) should now be visible
    await expect(page.getByText(/Sua mão/i)).toBeVisible();
  });

  test('E2E-034: cycles enforce caps and advance explicitly in Modo 2', async ({ page }) => {
    // Seed a 3-player round 2 directly in the store to skip the full setup flow
    await page.evaluate(() => {
      localStorage.setItem(
        'fodinha-hand',
        JSON.stringify({
          version: 2,
          state: {
            playerName: 'Alice',
            numPlayers: 3,
            round: 2,
            cardsPerPlayer: 2,
            manilha: { value: 'K' },
            handCards: [
              { value: 'A', played: false },
              { value: '4', played: false },
            ],
            otherPlayedCards: [],
            currentCycle: 1,
            cardsPlayedInCycle: 0,
            ownCardIndexThisCycle: null,
            otherCardsAddedThisCycle: 0,
          },
        })
      );
    });
    await page.goto('/');
    await page.getByText('Painel Individual').click();
    // Continue the seeded session (modal opens when a hand session exists)
    await page.getByRole('button', { name: /Continuar/i }).click();

    // Indicator visible with CICLO 1 and 0/3
    await expect(page.getByText('CICLO', { exact: true })).toBeVisible();
    await expect(page.getByText('0/3')).toBeVisible();

    // Next-cycle button is disabled (no cards played yet)
    const nextBtn = page.getByRole('button', { name: /Próximo Ciclo/i });
    await expect(nextBtn).toBeDisabled();

    // Previous-cycle button is disabled on cycle 1
    const prevBtn = page.getByRole('button', { name: 'Ciclo anterior' });
    await expect(prevBtn).toBeDisabled();

    // Play own card 'A' — counter becomes 1/3
    const handSection = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Minha mão' }) }).last();
    await handSection.getByRole('button', { name: /^A/ }).click();

    // Next-cycle button is now enabled
    await expect(nextBtn).toBeEnabled();

    // Other own card ('4') is now disabled for this cycle
    await expect(handSection.getByRole('button', { name: /^4/ })).toBeDisabled();

    // Click Next Cycle → CICLO 2, counter 0/3
    await nextBtn.click();
    await expect(page.locator('div').filter({ hasText: /^CICLO\s*2\s*0\/3/ }).first()).toBeVisible();

    // Now previous-cycle button is enabled (currentCycle > 1 and counter 0)
    await expect(prevBtn).toBeEnabled();

    // Click previous → back to CICLO 1
    await prevBtn.click();
    await expect(page.locator('div').filter({ hasText: /^CICLO\s*1\s*0\/3/ }).first()).toBeVisible();
  });
});

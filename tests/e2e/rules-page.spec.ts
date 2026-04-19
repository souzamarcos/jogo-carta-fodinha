import { test, expect } from '@playwright/test';

test.describe('Rules Page (SPEC-027)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('E2E-030: "Regras do jogo" link visible and navigates to rules page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Regras do jogo/i })).toBeVisible();
    await page.getByRole('link', { name: /Regras do jogo/i }).click();
    await expect(page.getByRole('heading', { name: /Regras do Jogo/i })).toBeVisible();
    await expect(page.getByText(/A manilha/i)).toBeVisible();
  });

  test('E2E-031: back button on rules page returns to home', async ({ page }) => {
    await page.goto('/rules');
    await page.getByText(/Voltar/i).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText(/Suporte Geral/i)).toBeVisible();
    await expect(page.getByText(/Painel Individual/i)).toBeVisible();
  });

  test('E2E-032: navigating to rules and back preserves active Mode 1 session', async ({ page }) => {
    // Start a Mode 1 session
    await page.getByText('Suporte Geral').click();
    await page.getByPlaceholder(/nome/i).fill('Alice');
    await page.getByRole('button', { name: /adicionar/i }).click();
    await page.getByPlaceholder(/nome/i).fill('Bob');
    await page.getByRole('button', { name: /adicionar/i }).click();
    await page.getByRole('button', { name: /Começar/i }).click();

    // Go back to home
    await page.goto('/');
    // Session badge should be visible
    await expect(page.getByText(/Rodada/i)).toBeVisible();

    // Navigate to rules
    await page.getByRole('link', { name: /Regras do jogo/i }).click();
    await expect(page.getByRole('heading', { name: /Regras do Jogo/i })).toBeVisible();

    // Navigate back
    await page.getByText(/Voltar/i).click();
    await expect(page).toHaveURL('/');
    // Session badge still present
    await expect(page.getByText(/Rodada/i)).toBeVisible();
  });

  test('E2E-033: rules page accessible via direct URL', async ({ page }) => {
    await page.goto('/rules');
    await expect(page.getByRole('heading', { name: /Regras do Jogo/i })).toBeVisible();
    await expect(page.getByText(/Objetivo do jogo/i)).toBeVisible();
  });

  test('E2E-034: no horizontal scroll on 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/rules');
    await expect(page.getByRole('heading', { name: /Regras do Jogo/i })).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});

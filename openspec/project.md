# Project Context

## Purpose
Fodinha PWA — a Progressive Web App that assists in-person matches of the Brazilian card game **Fodinha**. The app does not run the game logic of dealing cards; it helps players track game state. It is serverless: all state is persisted locally in `localStorage`. Installable on phones and desktops, fully functional offline.

The app has two completely independent modes, chosen on the home screen before any other action:
- **Modo 1 — Suporte Geral**: full match control (lives, bids, manilha, history, dealer rotation).
- **Modo 2 — Painel Individual**: assists a single player during a round (their hand, table cards, card-strength analysis).

Each mode persists its own isolated state. Neither mode reads or writes the other's state.

## Tech Stack
- React 18 + TypeScript
- Vite (with `vite-plugin-pwa`)
- Tailwind CSS (dark slate theme)
- React Router v6
- Zustand with `persist` middleware → `localStorage`
- Vitest + React Testing Library (unit) / Playwright (E2E)
- Workbox service worker (via `vite-plugin-pwa`)
- Deployed to GitHub Pages via CI on merge to `main`

## Project Conventions

### Code Style
- TypeScript throughout; functional React components.
- UI copy is in Brazilian Portuguese (pt-BR). Preserve exact UI strings ("Distribui", "Primeiro palpite", "Iniciar Rodada", "Finalizar Rodada", "Próximo Ciclo", etc.).

### Architecture Patterns
- Two isolated Zustand stores: `gameStore` (key `fodinha-game`) for Modo 1, `playerHandStore` (key `fodinha-hand`) for Modo 2.
- State persisted on every action; rehydrated on app open.
- Derived values (e.g. `cardsOnTable`) are computed, not stored.

### Testing Strategy
- Unit tests for `cardUtils`/`gameUtils` (card ordering, manilha calc, lives, ranking).
- Playwright E2E for full Modo 1 and Modo 2 flows.

### Git Workflow
- `main` is the deploy branch; merges to `main` trigger GitHub Pages deployment.

## Domain Context
Fodinha: 40-card deck (4 suits × 10 values). Value strength: `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`. Each round a "vira" determines the **manilha** (the value above the vira), which is the strongest card; among manilhas, suit breaks ties: `♣ Paus < ♥ Copas < ♠ Espadas < ♦ Ouros`. Players bid how many tricks they will win; lives lost = `|bid − tricks won|`. Players start with 5 lives; reaching 0 eliminates them. Last player standing wins; simultaneous eliminations trigger sudden-death extra rounds.

## Important Constraints
- No backend; all state local. Must work fully offline.
- Mobile-first: `max-width: 480px` centered; touch targets ≥ 44×44 CSS px.
- The two modes must never share state.

## External Dependencies
- GitHub Pages (static hosting + CI deploy).

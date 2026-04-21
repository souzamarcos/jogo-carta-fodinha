# Tasks — Página de Regras do Jogo (SPEC-027)

**Feature**: Clickable "Regras do jogo" link on home screen + full game rules page  
**Spec**: [spec.md](./spec.md)  
**Plan**: [impl-plan.md](../../.specify/impl-plan.md) (Sprint 15)  
**Total tasks**: 11  
**Generated**: 2026-04-19

---

## User Stories

| ID  | Story | Priority | Source |
|-----|-------|----------|--------|
| US1 | Link "Regras do jogo" na tela inicial navega para a página de regras | P1 | FR-001, FR-002, Scenarios 1–2 |
| US2 | Usuário lê as regras completas do jogo com navegação de retorno | P1 | FR-003, FR-004, Scenarios 3–4 |
| US3 | Página legível em dispositivos móveis e acessível por URL direta | P2 | FR-005, Scenarios 5–6 |

---

## Phase 1 — Setup (route registration)

> **Goal**: Register the `/rules` route in the application router so the page is reachable before any content exists.

- [x] T001 Register `/rules` route in `src/App.tsx` (import `RulesPage` placeholder and add `{ path: '/rules', element: <RulesPage /> }` to `createBrowserRouter` array)

---

## Phase 2 — Foundational (RulesPage skeleton)

> **Goal**: Create a minimal `RulesPage` component that renders without errors. Prerequisite for all user story phases.

- [x] T002 Create `src/pages/RulesPage.tsx` with a minimal scaffold: default export `RulesPage` function returning a `<div>` with the page title "Regras do Jogo" and a placeholder "← Voltar" button (no logic yet — wire in US2)

---

## Phase 3 — US1: Link de navegação na tela inicial

> **Story goal**: A user on the home screen can see and tap "Regras do jogo" to open the rules page.  
> **Independent test**: The link is present in `HomePage` and its `href` resolves to `/rules`.

- [x] T003 [US1] Add `<Link to="/rules">Regras do jogo</Link>` to `src/pages/HomePage.tsx` below the mode-selection buttons — use `text-slate-400 hover:text-white underline text-sm py-3 px-4 inline-block` and wrap in a `div className="mt-6 text-center"` (see impl-plan Sprint 15 for exact markup)

- [x] T004 [P] [US1] Write unit tests in `src/pages/__tests__/HomePage.test.tsx`:
  - `'renders "Regras do jogo" link'` — render `<MemoryRouter><HomePage /></MemoryRouter>`, assert `screen.getByText(/Regras do jogo/i)` is in the document
  - `'"Regras do jogo" link has href /rules'` — assert the link element has `to="/rules"` (or verify the rendered `<a>` has `href="/rules"`)

---

## Phase 4 — US2: Conteúdo completo das regras + navegação de retorno

> **Story goal**: The rules page shows all 12 required sections and has a working back button.  
> **Independent test**: Render `<RulesPage />` and assert all 12 headings are present; clicking "← Voltar" calls `navigate(-1)`.

- [x] T005 [US2] Implement all 12 required rule sections in `src/pages/RulesPage.tsx` using the `Section` helper component (see impl-plan Sprint 15 for full JSX). Required section headings:
  1. "Objetivo do jogo"
  2. "O baralho"
  3. "A manilha (carta curinga)"
  4. "Rodadas e distribuição de cartas"
  5. "O distribuidor"
  6. "Palpite (bid)"
  7. "Vaza (trick)"
  8. "Cálculo de perda de vidas"
  9. "Eliminação e vitória"
  10. "Modos do aplicativo"
  
  Each section wrapped in `<section className="mb-6 bg-slate-800 rounded-xl p-4">`. Inline examples with concrete values (e.g., "se a vira é o 4, a manilha é o 5"). Card hierarchy grid for O baralho section. Loss examples table for Cálculo section.

- [x] T006 [US2] Wire back-navigation in `src/pages/RulesPage.tsx`: import `useNavigate` from `react-router-dom`; call `navigate(-1)` when the "← Voltar" button is clicked; add `className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 min-h-[44px] px-2"` to the button

- [x] T007 [P] [US2] Write unit tests in `src/pages/__tests__/RulesPage.test.tsx`:
  - `'renders all required section headings'` — render `<MemoryRouter><RulesPage /></MemoryRouter>`; assert each of the 10 section headings above is in the document
  - `'renders card value hierarchy'` — assert values "4" and "3" both appear (representing weakest and strongest)
  - `'clicking Voltar calls navigate(-1)'` — mock `useNavigate`; click `screen.getByText(/Voltar/i)`; assert mock was called with `-1`

---

## Phase 5 — US3: Legibilidade mobile e acesso por URL direta

> **Story goal**: The page is scrollable without horizontal overflow on 320–768px screens; it loads correctly when accessed directly via `/rules`.  
> **Independent test**: Playwright snapshot shows no horizontal scrollbar at 375px width; direct `page.goto('/rules')` renders the title.

- [x] T008 [US3] Apply responsive layout to `src/pages/RulesPage.tsx` outer container: `className="min-h-screen bg-slate-900 text-slate-300 px-4 py-6 max-w-lg mx-auto"` — verify no fixed-width elements exceed their parent; ensure `overflow-x: hidden` is not needed (content naturally wraps)

- [x] T009 [P] [US3] Write Playwright E2E scenarios in `tests/e2e/` (add to an existing spec file or create `rules-page.spec.ts`):
  - **E2E-030**: `'link "Regras do jogo" visible and navigates to rules page'` — `page.goto('/')`, assert link visible, click it, assert heading "Regras do Jogo" and section "A manilha" are visible
  - **E2E-031**: `'back button on rules page returns to home'` — `page.goto('/rules')`, click "← Voltar", assert URL ends with `/` and mode buttons are visible
  - **E2E-032**: `'navigating to rules and back preserves active Mode 1 session'` — start a Mode 1 session, go to home, click rules link, click back, assert session badge still shows round info
  - **E2E-033**: `'rules page accessible via direct URL'` — `page.goto('/rules')`, assert "Regras do Jogo" heading visible without redirect
  - **E2E-034**: `'no horizontal scroll on 375px viewport'` — `page.setViewportSize({ width: 375, height: 812 })`, `page.goto('/rules')`, assert `document.documentElement.scrollWidth <= 375`

---

## Phase 6 — Polish & Documentation

> Cross-cutting compliance with project constitution (rules documented, E2E scenarios documented).

- [x] T010 [P] Add business rule to `docs/business-rules.md`:
  ```markdown
  ### RN-025: Acesso às regras do jogo
  - **Descrição**: A tela inicial exibe o link "Regras do jogo" que abre a página `/rules` com as regras completas do Fodinha.
  - **Comportamento esperado**: O link é sempre visível na tela inicial. Navegar para as regras e voltar não afeta o estado de nenhuma sessão ativa (Modo 1 ou Modo 2).
  - **Exceções**: Nenhuma.
  ```

- [x] T011 [P] Add E2E scenario references to `docs/e2e-test-scenarios.md` for E2E-030 through E2E-034 (brief descriptions matching the Playwright tests in T009)

---

## Dependency Graph

```
T001 (route) ──► T002 (skeleton)
                   ├──► T003 (link in HomePage) ──► T004 (link tests)
                   ├──► T005 (content sections)
                   │       └──► T006 (back button) ──► T007 (content tests)
                   └──► T008 (responsive layout) ──► T009 (E2E tests)

T010, T011 — independent (docs only), parallel with any phase
```

## Parallel Execution Opportunities

| Group | Tasks | Can run simultaneously |
|-------|-------|----------------------|
| After T002 | T003, T005, T008, T010, T011 | All independent — different files |
| After T003 | T004 | Tests for link |
| After T005+T006 | T007 | Unit tests for content + back nav |
| After T008 | T009 | E2E tests for layout + URL access |

## Implementation Strategy

**MVP** (US1 + US2, tasks T001–T007): Link navigates to a content-complete rules page with working back button. Satisfies all P1 functional requirements and the constitution's test coverage principle.

**Full** (+ US3, tasks T008–T011): Adds responsive layout validation, E2E tests, and documentation compliance.

## Success Criteria Traceability

| Criterion (spec.md) | Covered by |
|---------------------|-----------|
| Link visible without scrolling on ≥ 375px | T003, T004, T009 (E2E-030) |
| Navigation to rules without state loss | T003, T009 (E2E-032) |
| All 12 required content sections present | T005, T007 |
| No horizontal scroll on 320–768px | T008, T009 (E2E-034) |
| Back button functional (in-page + native) | T006, T007, T009 (E2E-031) |

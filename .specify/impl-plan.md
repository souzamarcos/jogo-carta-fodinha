# Implementation Plan — Fodinha PWA

**Branch**: `claude/fervent-torvalds`
**Spec**: `spec.md`
**Generated**: 2026-04-12

---

## Technical Context

| Item | Value |
|---|---|
| Framework | React 18 + TypeScript (strict) |
| Build | Vite 5 + `vite-plugin-pwa` |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State | Zustand 4 + `persist` middleware |
| Testing (unit) | Vitest + React Testing Library |
| Testing (E2E) | Playwright |
| PWA/SW | Workbox via `vite-plugin-pwa` |
| Storage | `localStorage` only — no network |
| Target | Mobile-first (iOS/Android installable PWA) |

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| Cobertura de Testes Obrigatória | ✅ | Every phase includes test tasks; `cardUtils` and `gameUtils` have dedicated test tasks |
| DRY | ✅ | `CardGrid` reused across Mode 1 (manilha selector) and Mode 2 (Block A + setup); `cardUtils` shared |
| README Completo | ⚠️ PENDING | `README.md` must be updated after implementation (currently has TODO for stack/run instructions) |
| Regras de Negócio Documentadas | ✅ | `docs/business-rules.md` fully populated |
| Cenários E2E Documentados | ✅ | `docs/e2e-test-scenarios.md` fully populated |

**Gate**: README update is tracked as SPEC-018 (final task). No blocking violations.

---

## Phase 0 — Research

> See `research.md` for resolved decisions. Key findings summary:

- **vite-plugin-pwa**: use `generateSW` strategy with Workbox `CacheFirst` for assets; `NetworkFirst` not needed (no network calls); `manifest.webmanifest` in `public/`
- **Zustand persist**: use `partialize` to exclude transient UI state; version field + `migrate` function for future schema changes; `storage: localStorage` (default)
- **React Router v6**: `createBrowserRouter` with nested routes; each mode group under `/game/*` and `/player`; `<Outlet>` not needed (flat pages per mode)
- **Tailwind**: `min-h-[44px]` for all touch targets; `grid-cols-5` for 10-value card grid; `opacity-40` for grayed-out cards
- **Vitest**: wrap store tests with `beforeEach(() => useStore.setState(initialState))`; use `@testing-library/user-event` for touch interactions

---

## Phase 1 — Implementation Phases

### Sprint 1: Foundation (SPEC-001, SPEC-002, SPEC-003, SPEC-004)

#### SPEC-001 — Project Initialization
**Files to create:**
- `package.json` — deps: `react`, `react-dom`, `react-router-dom`, `zustand`, `uuid`; devDeps: `vite`, `vite-plugin-pwa`, `tailwindcss`, `typescript`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `playwright`
- `vite.config.ts` — configure `vite-plugin-pwa` with manifest + Workbox cache strategies
- `tailwind.config.ts` — extend with game color tokens (`lives-green`, `lives-yellow`, `lives-red`, `card-disabled`)
- `tsconfig.json` — strict mode, path aliases (`@/` → `src/`)
- `public/manifest.webmanifest` — name, icons, display standalone, theme_color, background_color
- `public/icons/` — icon-192.png, icon-512.png, icon-512-maskable.png
- `src/main.tsx`, `src/App.tsx` — router setup
- `src/types.ts` — all shared TypeScript types (CardValue, CardSuit, Card, GamePhase, etc.)

**Tests:** none for initialization; verify build passes with `npm run build`

---

#### SPEC-002 — Zustand Stores
**Files to create:**
- `src/store/gameStore.ts`
  - State shape: `GameState` (from data-model.md)
  - Actions: all `GameStoreActions` from contracts/store-actions.md
  - Persist config: key `fodinha-game`, version 1, `partialize` (exclude nothing — full state)
- `src/store/playerHandStore.ts`
  - State shape: `PlayerHandState`
  - Actions: all `PlayerHandStoreActions`
  - Persist config: key `fodinha-hand`, version 1

**Tests (`src/store/__tests__/`):**
- `gameStore.test.ts`: startGame, setBid, confirmResult (win/loss/tiebreak), rematch
- `playerHandStore.test.ts`: initSession, addHandCard, toggleHandCardPlayed, addOtherPlayedCard, finishRound

---

#### SPEC-003 — cardUtils
**File:** `src/utils/cardUtils.ts`

**Functions to implement** (all with JSDoc):
```ts
compareCards(a: CardValue, b: CardValue): number
isManilha(card: Card, manilha: Card): boolean
compareManilhaSuits(a: CardSuit, b: CardSuit): number
sortHandStrongest(cards: HandCard[], manilha: Card | null): HandCard[]
countRemainingNonManilha(value, handCards, otherPlayed): number
countRemainingManilhaSuit(suit, manilhaValue, handCards, otherPlayed): 0 | 1
```

**Tests (`src/utils/__tests__/cardUtils.test.ts`):**
- All 10 values in correct order
- Manilha detection
- Suit comparison (paus < copas < espadas < ouros)
- sortHandStrongest with mixed manilha + non-manilha
- countRemainingNonManilha: base=4, subtract hand, subtract known played, ignore 'unknown'
- countRemainingManilhaSuit: 0 or 1 per suit

---

#### SPEC-004 — gameUtils
**File:** `src/utils/gameUtils.ts`

**Functions:**
```ts
alivePlayers(state: GameState): Player[]
calcCardsPerPlayer(round: number, aliveCount: number): number
calcLoss(bid: number, tricks: number): number
getFirstBidderIndex(dealerIndex: number, alivePlayers: Player[]): number
nextDealerIndex(current: number, alivePlayers: Player[]): number
cardsOnTable(state: PlayerHandState): number
```

**Tests (`src/utils/__tests__/gameUtils.test.ts`):**
- calcCardsPerPlayer: below limit, at limit, above limit
- calcLoss: exact match (0), over, under
- alivePlayers: filters and sorts correctly

---

### Sprint 2: Shared Components (SPEC-005)

#### SPEC-005 — Shared Components
**Files:**

`src/components/CardGrid.tsx`
- Layout: 9-value row (non-manilha) + manilha row (4 suits as separate buttons)
- Props: `CardGridProps` (see contracts/store-actions.md)
- Badge overlay: colored circle with count
- Badge 0: `opacity-40` + `pointer-events-none` (when `disableAtZero=true`) or just `opacity-40` (Block A)
- `disabled` prop: all buttons `opacity-40 pointer-events-none`

`src/components/CardDisplay.tsx`
- Visual card with value + optional suit emoji
- `played` prop: shows strikethrough + opacity

`src/components/LivesIndicator.tsx`
- Colored dot/badge: green (`lives>3`), yellow (`lives===3`), red (`lives<=2`)

`src/components/PlayerCard.tsx`
- Name + LivesIndicator + optional "eliminated" overlay

`src/components/BidInput.tsx`
- Stepper: `−` button, value display, `+` button; min=0, max=cardsPerPlayer

`src/components/Timer.tsx`
- Hook `useTimer(startedAt: string)` returns `mm:ss` string
- Re-renders every second via `setInterval`

`src/components/RoundHistoryTable.tsx`
- Accordion: collapsed label + expand icon
- Table: Rodada | Manilha | Cartas/Jogador | [PlayerName columns]

`src/components/ConfirmResultModal.tsx`
- Modal overlay with backdrop
- Table: Jogador | Palpite | Fez | Diferença | Vidas perdidas
- Confirm + Voltar buttons

**Tests:**
- `CardGrid.test.tsx`: renders badges, badge-0 disabling, manilha row, onCardSelect called
- `LivesIndicator.test.tsx`: correct color class per lives value
- `BidInput.test.tsx`: increment/decrement, min/max clamping

---

### Sprint 3: Mode Selection + Mode 1 Setup (SPEC-006, SPEC-007)

#### SPEC-006 — Home Page (`/`)
**File:** `src/pages/HomePage.tsx`

- Two mode cards with `gameStore` + `playerHandStore` session detection
- Badge "Em andamento" + round info when active
- Modal: "Continuar" or "Nova Sessão" (with `resetGame()` / `resetSession()` for new)

**Tests:** session badge visibility, modal trigger, navigation

---

#### SPEC-007 — Game Setup (`/game/setup`)
**File:** `src/pages/GameSetupPage.tsx`

- Player name input with inline duplicate validation (case-insensitive, trim)
- Reorder via ↑↓ buttons (drag-and-drop deferred to post-v1)
- Remove button per player
- "Começar" enabled only with ≥2 players

**Tests:** duplicate detection, blank name rejection, min-player gate

---

### Sprint 4: Mode 1 Game Flow (SPEC-008 → SPEC-014)

#### SPEC-008 — Bid Phase
**File:** `src/pages/GameRoundPage.tsx` (phase: `bid`)

- Manilha selector (value + suit) at top
- Bid list: player name + BidInput, ordered by `firstBidderIndex`
- Current bidder highlighted
- "Iniciar Rodada" enabled only when all bids set + manilha selected

---

#### SPEC-009 — Playing Phase
**File:** `src/pages/GameRoundPage.tsx` (phase: `playing`)

- Manilha in large highlighted card
- Timer (informational, mm:ss)
- Bids summary list
- "Finalizar Rodada" button

---

#### SPEC-010 — Result Phase + Modal (SPEC-011 included)
**File:** `src/pages/GameRoundPage.tsx` (phase: `result`)

- Tricks input per alive player (BidInput reused, min=0)
- "Confirmar" → `ConfirmResultModal`
- Modal: table with losses; Confirm calls `confirmResult()`

---

#### SPEC-012 — Tiebreak Phase
**File:** `src/pages/GameRoundPage.tsx` (phase: `tiebreak`)

- Modal with "Declarar Empate" + "Rodada Extra" buttons
- "Declarar Empate" → `declareTie()` → navigate `/game/winner`
- "Rodada Extra" → `startTiebreakRound()` → back to bid phase

---

#### SPEC-013 — Round History (collapsible)
**File:** `src/pages/GameRoundPage.tsx` (always visible)

- `RoundHistoryTable` component below lives panel
- Collapsed by default; accordion click to expand
- Data from `gameStore.history`

---

#### SPEC-014 — Winner Page
**File:** `src/pages/WinnerPage.tsx`

- Winner name(s) in large display
- Summary: total rounds, total time (startedAt → finishedAt)
- "Revanche" → `rematch()` → navigate `/game/round`
- "Início" → `resetGame()` → navigate `/`

---

### Sprint 5: Mode 2 Player Panel (SPEC-015)

#### SPEC-015 — Player Page (`/player`)
**File:** `src/pages/PlayerPage.tsx`

Sub-sections (rendered conditionally by `playerHandStore` state):

**Config screen** (no session):
- Name input + numPlayers input → `initSession()`

**Setup Etapa 1** (session exists, `manilha === null`):
- CardSelector (value first, then suit) → `setManilha()`
- "Confirmar Manilha" button

**Setup Etapa 2** (manilha set, `handCards.length < cardsPerPlayer`):
- CardGrid (setup mode: `disableAtZero=true`, manilha row always visible)
- Hand list with × buttons
- `cardsPerPlayer` display + ±1 manual adjust
- "Iniciar Rodada" when ≥1 card

**Play screen** (round started):
- Stacked layout:
  1. Manilha display (top, compact)
  2. Round info: rodada N, cartas/jogador N
  3. Cards-on-table counter (derived) + progress bar
  4. **Block A**: CardGrid (Block A mode: `disableAtZero=false`; limit disables all at max)
     - List of `otherPlayedCards` below grid (each with ×)
  5. **Block B**: `MyHandBlock` — hand cards as touch targets, toggle played
  6. Analysis: sorted remaining hand cards + ranking labels
  7. "Finalizar Rodada" button (always enabled)

**Tests:**
- `PlayerPage.test.tsx`: setup flow, cardGrid badge counts, Block A + B interactions, finishRound clears state

---

### Sprint 6: PWA + E2E (SPEC-016, SPEC-017, SPEC-018)

#### SPEC-016 — PWA Configuration
**Files:**
- `vite.config.ts` (update): Workbox `globPatterns`, `runtimeCaching` for all routes
- `public/manifest.webmanifest`: complete with `start_url`, `scope`, `screenshots` (optional)
- `public/icons/`: generate with `pwa-asset-generator` or equivalent

**Validation:** Lighthouse PWA audit ≥ 90; "Add to Home Screen" prompt fires on Chrome mobile

---

#### SPEC-017 — E2E Tests
**Files:** `tests/e2e/`

Scenarios from `docs/e2e-test-scenarios.md`:
- `mode1-full-game.spec.ts`: E2E-001, E2E-003, E2E-004, E2E-005, E2E-006, E2E-007, E2E-013, E2E-014
- `mode1-setup.spec.ts`: E2E-002, E2E-008
- `mode1-lives.spec.ts`: E2E-009, E2E-010
- `mode2-full.spec.ts`: E2E-011, E2E-012
- `pwa.spec.ts`: E2E-015 (offline + install — requires special Playwright PWA setup)

---

#### SPEC-018 — README Update
**File:** `README.md`

Update with:
- Stack description
- `npm install && npm run dev` instructions
- Links to `docs/business-rules.md`, `docs/e2e-test-scenarios.md`, `.specify/constitution.md`
- Screenshots (optional, post-implementation)

---

## Dependency Graph

```
SPEC-001 (init)
  └─► SPEC-002 (stores)
  └─► SPEC-003 (cardUtils)     ◄─── required by SPEC-005, SPEC-015
  └─► SPEC-004 (gameUtils)     ◄─── required by SPEC-002, SPEC-008
  └─► SPEC-005 (components)    ◄─── required by SPEC-006..015
        └─► SPEC-006 (home)
        └─► SPEC-007 (setup)
              └─► SPEC-008 (bid)
                    └─► SPEC-009 (playing)
                          └─► SPEC-010 (result) + SPEC-012 (tiebreak)
                                └─► SPEC-013 (history) [parallel]
                                └─► SPEC-014 (winner)
        └─► SPEC-015 (player panel)
SPEC-016 (PWA) — parallel after SPEC-001
SPEC-017 (E2E) — after all features
SPEC-018 (README) — last
```

## Estimated Task Count

| Sprint | Tasks | Dependencies |
|---|---|---|
| 1 — Foundation | SPEC-001..004 | None |
| 2 — Components | SPEC-005 | Sprint 1 |
| 3 — Mode 1 Setup | SPEC-006, SPEC-007 | Sprint 2 |
| 4 — Mode 1 Flow | SPEC-008..014 | Sprint 3 |
| 5 — Mode 2 | SPEC-015 | Sprint 2 |
| 6 — PWA + E2E | SPEC-016..018 | Sprints 4+5 |

Total: **18 tasks** across 6 sprints. Sprints 4 and 5 can run in parallel.

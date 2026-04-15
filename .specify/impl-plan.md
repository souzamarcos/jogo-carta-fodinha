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

### Sprint 8: Dealer Selection Flow — Mode 1 (SPEC-020)

#### SPEC-020 — Dealer Selection Flow and Player Order Stabilization

**Goal:** In Modo 1, hide palpite inputs until manilha is selected, introduce a dealer-confirmation step, stabilize player display order across all phases, and automate circular dealer rotation per round.

**Files to modify:**

`src/store/gameStore.ts`
- Add `BidSubPhase` type: `'manilha' | 'dealer' | 'bids'`
- Update `RoundState` interface: add `bidSubPhase: BidSubPhase`; change `manilha` to `Card | null` (null until selected)
- Update `startGame()`: set `dealerIndex = 0`; initialize `currentRound.bidSubPhase = 'manilha'`; `manilha = null`
- Update `setManilha(card)`: set `currentRound.bidSubPhase = 'dealer'` after storing card
- Add `confirmDealer(overrideDealerIndex?: number): void`:
  - If `overrideDealerIndex` provided → update `state.dealerIndex`
  - Recalculate `currentRound.firstBidderIndex = (dealerIndex + 1) % alivePlayers().length`
  - Set `currentRound.bidSubPhase = 'bids'`
- Update `confirmResult()` → next round: set `currentRound.bidSubPhase = 'manilha'`; `currentRound.manilha = null`
- Update `startTiebreakRound()`: set `currentRound.bidSubPhase = 'manilha'`; `currentRound.manilha = null`
- Update `rematch()`: same as `startGame()` — bidSubPhase = 'manilha'
- Update Zustand persist `version` (bump to 2) and `migrate` function to handle old state without `bidSubPhase`

`src/store/__tests__/gameStore.test.ts`
- Add tests: `setManilha` transitions bidSubPhase to 'dealer'
- Add tests: `confirmDealer()` transitions to 'bids', updates firstBidderIndex
- Add tests: `confirmDealer(overrideIndex)` updates dealerIndex
- Add tests: next round resets bidSubPhase to 'manilha'
- Add tests: dealer rotation correct over 3+ rounds with dead players

`src/utils/gameUtils.ts`
- Add `getDealerId(state: GameState): string | null` — returns `alivePlayers(state)[state.dealerIndex]?.id ?? null`
- Add `getFirstBidderId(state: GameState): string | null` — returns `alivePlayers(state)[(state.dealerIndex + 1) % alive.length]?.id ?? null`

`src/utils/__tests__/gameUtils.test.ts`
- Add tests: `getDealerId` and `getFirstBidderId` with alive/dead player combinations

`src/components/PlayerCard.tsx`
- Add `isDealer?: boolean` and `isFirstBidder?: boolean` props
- Render persistent label `"Distribui"` when `isDealer=true` (small `text-xs` tag below/beside name)
- Render persistent label `"Primeiro palpite"` when `isFirstBidder=true`
- Both labels can appear simultaneously (single-alive-player edge case)

`src/components/__tests__/PlayerCard.test.tsx` (or existing test file)
- Add tests: label "Distribui" renders when `isDealer=true`
- Add tests: label "Primeiro palpite" renders when `isFirstBidder=true`
- Add tests: no labels when both props are false/undefined

`src/pages/GameRoundPage.tsx` — `BidPhase` component
- Replace `ordered` array rotation with stable registration-order list: `alive` (already sorted by `position`)
- Render three conditional sections based on `currentRound.bidSubPhase`:
  - `'manilha'`: show only manilha selector; no bid inputs, no dealer step
  - `'dealer'`: show manilha (confirmed, read-only) + DealerSelectionStep
  - `'bids'`: show manilha (confirmed, read-only) + bid inputs in registration order
- Pass `isDealer` and `isFirstBidder` props to each `PlayerCard` in all sections
- `PlayingPhase` and `ResultPhase`: render players in registration order with `isDealer`/`isFirstBidder` props

New inline component `DealerSelectionStep` (within `GameRoundPage.tsx` or `src/components/DealerSelectionStep.tsx`):
- Shows alive players in registration order with `isDealer`/`isFirstBidder` labels
- Round 1: shows pre-selected dealer; only a "Confirmar" button (`confirmDealer()` with no override)
- Round 2+: shows pre-selected dealer + button/selector to change dealer; "Confirmar" calls `confirmDealer(selectedIndex)`
- Selecting a different dealer updates local selection state immediately (live preview of tooltips) before confirm

**Tests (`src/pages/__tests__/GameRoundPage.test.tsx` or equivalent):**
- Palpite inputs hidden when `bidSubPhase === 'manilha'`
- DealerSelectionStep visible when `bidSubPhase === 'dealer'`
- Palpite inputs visible when `bidSubPhase === 'bids'`
- No edit button in dealer step on round 1
- Edit button present in dealer step on round 2
- Changing dealer updates "Primeiro palpite" label in real time
- Player order is registration order in all three sub-phases and in playing/result phases

**Dependencies:** SPEC-002 (gameStore), SPEC-004 (gameUtils), SPEC-005 (PlayerCard), SPEC-008 (BidPhase)

---

### Sprint 7: GitHub Pages Deployment (SPEC-019)

#### SPEC-019 — GitHub Pages Automatic Deployment

**Goal:** Every merge to `main` automatically builds and publishes the Fodinha PWA to GitHub Pages.

**Files to create/modify:**

`.github/workflows/deploy.yml` — new file
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build -- --base=/jogo-carta-fodinha/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

`vite.config.ts` — update the `vite-plugin-pwa` manifest to set `start_url: '/jogo-carta-fodinha/'` and `scope: '/jogo-carta-fodinha/'` so the PWA is installable at the sub-path URL:
```ts
manifest: {
  name: 'Fodinha',
  short_name: 'Fodinha',
  description: 'Auxiliar para o jogo de cartas Fodinha',
  display: 'standalone',
  start_url: '/jogo-carta-fodinha/',
  scope: '/jogo-carta-fodinha/',
  theme_color: '#1e293b',
  background_color: '#0f172a',
  icons: [ ... ],   // unchanged
},
```

`README.md` — add deploy status badge below the project title:
```markdown
![Deploy](https://github.com/souzamarcos/jogo-carta-fodinha/actions/workflows/deploy.yml/badge.svg)
```

**GitHub repository settings (manual, one-time):**
- Settings → Pages → Source → **GitHub Actions**
- No branch selection needed when using the Actions-native deployment.

**Validation:**
- Push a commit to `main` → workflow runs → deploy job succeeds → app loads at `https://souzamarcos.github.io/jogo-carta-fodinha/`
- All routes load from root URL (deep links are a known limitation; not in scope)
- PWA install prompt appears in Chrome at the public URL
- Pushing a commit with a build error → workflow fails → previously deployed version stays live

**Tests:** No automated tests for the workflow itself. Validation is observational (see above). The build step (`npm run build -- --base=/jogo-carta-fodinha/`) doubles as a smoke test — if the TypeScript build or bundler fails, the workflow fails before deployment.

**Dependencies:** SPEC-018 (README must be ready to receive the badge). Can otherwise run independently.

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
SPEC-019 (GitHub Pages deploy) — after SPEC-018
SPEC-020 (dealer flow) — after SPEC-002, SPEC-004, SPEC-005, SPEC-008; before SPEC-017
SPEC-021 (fix dealer labels in playing/result phases) — after SPEC-020
SPEC-022 (merge playing + result phases) — after SPEC-021
SPEC-023 (extend dealer toggle) — after SPEC-022
SPEC-024 (edit player order) — after SPEC-023
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
| 7 — CI/CD | SPEC-019 | Sprint 6 |
| 8 — Dealer Flow | SPEC-020 | Sprints 1–4 |
| 9 — Fix Dealer Labels | SPEC-021 | Sprint 8 |
| 10 — Merge Playing+Result | SPEC-022 | Sprint 9 |
| 11 — Extend Dealer Toggle | SPEC-023 | Sprint 10 |
| 12 — Edit Player Order | SPEC-024 | Sprint 11 |

Total: **24 tasks** across 12 sprints.

---

### Sprint 9: Fix Dealer Labels in Playing and Result Phases (SPEC-021)

#### SPEC-021 — Fix: Dealer Labels Persist Through All Game Phases

**Goal:** The "Distribui" and "Primeiro palpite" labels must be visible on player cards in `PlayingPhase` and `ResultPhase`, not only in `BidPhase`. This is an incomplete implementation from SPEC-020.

**Root cause:** In `src/pages/GameRoundPage.tsx`, `PlayingPhase` had its old `isDealer` calculation removed in SPEC-020 but was not replaced with the new `getDealerId`/`getFirstBidderId` helpers. `ResultPhase` has the same omission.

**Files to modify:**

`src/pages/GameRoundPage.tsx` — `PlayingPhase` function
- The function already calls `const state = useGameStore(s => s)` and imports `getDealerId`, `getFirstBidderId` at the file level.
- Add: `const dealerId = getDealerId(state);`
- Add: `const firstBidderId = getFirstBidderId(state);`
- In the `alive.map(player => ...)` block, update `<PlayerCard>` to pass:
  - `isDealer={player.id === dealerId}`
  - `isFirstBidder={player.id === firstBidderId && alive.length > 1}`

`src/pages/GameRoundPage.tsx` — `ResultPhase` function
- The function calls `const state = useGameStore(s => s)`. The `getDealerId`/`getFirstBidderId` imports are already at the file level.
- Add: `const dealerId = getDealerId(state);`
- Add: `const firstBidderId = getFirstBidderId(state);`
- In the `alive.map(player => ...)` block, update `<PlayerCard>` to pass:
  - `isDealer={player.id === dealerId}`
  - `isFirstBidder={player.id === firstBidderId && alive.length > 1}`

**Tests (`src/pages/__tests__/GameRoundPage.test.tsx` or equivalent):**
- Playing phase: "Distribui" label present on dealer's row after `startRound()`
- Playing phase: "Primeiro palpite" label present on first-bidder's row after `startRound()`
- Result phase: "Distribui" label present on dealer's row during result phase
- Result phase: "Primeiro palpite" label present on first-bidder's row during result phase
- Labels match the same player identified during bids phase (consistency check)

**Tests (`docs/e2e-test-scenarios.md`):**
- Add scenario: dealer labels persist through bid → playing → result phases in the same round

**Dependencies:** SPEC-020 (`getDealerId`, `getFirstBidderId`, `PlayerCard` props all already implemented)

---

### Sprint 10: Merge Playing and Result Phases (SPEC-022)

#### SPEC-022 — Merge Playing and Result Phases in Mode 1

**Goal:** Eliminate the separate result phase in Mode 1 by merging it into the playing phase. After clicking "Iniciar Rodada", the tricks inputs are immediately active and pre-filled with each player's bid. "Finalizar Rodada" validates the tricks total and applies scoring directly — no intermediate result screen.

**Files to modify:**

`src/store/gameStore.ts`
- Update `startRound()`:
  - Pre-fill `currentRound.tricks` with the current `bids` values: `tricks: { ...currentRound.bids }`
  - Effect: when the playing phase loads, each player's tricks input already shows their bid value
- Bump persist `version` to 3
- Add migration for `fromVersion < 3`: if `currentRound` and `phase === 'playing'` and `tricks` is empty, no action needed (safe to leave empty — user will fill in before confirming)

`src/pages/GameRoundPage.tsx` — `PlayingPhase` function
- Remove `endRound` import and usage
- Add to store subscriptions: `setTricks` and `confirmResult`
- Add local state: `const [tricksError, setTricksError] = useState<string | null>(null)`
- Compute derived values:
  ```ts
  const cardsPerPlayer = currentRound?.cardsPerPlayer ?? 1;
  const totalTricks = alive.reduce((sum, p) => sum + (currentRound?.tricks[p.id] ?? 0), 0);
  const tricksMismatch = totalTricks !== cardsPerPlayer;
  ```
- In the player list (currently shows bid as read-only), update each row to show:
  - Bid as read-only label: `<span className="text-xs text-slate-400">palpite: {bid}</span>`
  - Tricks input: `<BidInput value={tricks} max={cardsPerPlayer} onChange={v => { setTricks(player.id, v); setTricksError(null); }} />`
- Below the player list, show inline error when mismatch:
  ```tsx
  {tricksError && (
    <p className="text-yellow-400 text-xs mb-2">{tricksError}</p>
  )}
  ```
- Update "Finalizar Rodada" button handler:
  ```ts
  function handleFinish() {
    if (tricksMismatch) {
      setTricksError(`⚠️ Total de vazas (${totalTricks}) ≠ cartas por jogador (${cardsPerPlayer})`);
      return;
    }
    confirmResult();
  }
  ```
- Button `onClick` → `handleFinish`; button remains always enabled (no `disabled` prop)

`src/pages/GameRoundPage.tsx` — `GameRoundPage` component
- Remove `{phase === 'result' && <ResultPhase />}` line
- The `ResultPhase` function itself can be removed from the file

**Contracts update (`src/store/contracts/store-actions.md`)**
- Update `startRound()` effect note: add "pre-fills `tricks` with current `bids` values"
- Add note on `endRound()`: "No longer called in the normal Mode 1 flow; retained for potential future use"

**Business rules update (`docs/business-rules.md`)**
- Update the Mode 1 round flow section to reflect the merged phase: `bid → playing (with tricks) → bid (next round)`
- Remove or update description of the result phase

**E2E scenarios update (`docs/e2e-test-scenarios.md`)**
- Update existing playing → result → confirm scenario to reflect the new merged flow
- Add scenario: tricks inputs visible and pre-filled with bids in playing phase
- Add scenario: "Finalizar Rodada" blocked with validation error when tricks total is wrong
- Add scenario: "Finalizar Rodada" succeeds and advances directly to next round

**Tests (`src/store/__tests__/gameStore.test.ts`)**
- Add: `startRound()` pre-fills `tricks` with bid values
  ```ts
  it('pre-fills tricks with bid values on startRound', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const { players } = useGameStore.getState();
    const [p1, p2] = players;
    // advance to bids sub-phase
    useGameStore.getState().setManilha({ value: '7' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().startRound();
    const { currentRound } = useGameStore.getState();
    expect(currentRound?.tricks[p1.id]).toBe(1);
    expect(currentRound?.tricks[p2.id]).toBe(0);
  });
  ```

**Tests (`src/pages/__tests__/GameRoundPage.test.tsx`)**
- Remove: all tests in `ResultPhase — dealer labels` describe block (result phase no longer rendered)
- Update `makeRound()` helper: add `tricks: { alice: 1, bob: 0 }` as default (since they are now pre-filled)
- Add describe block: `PlayingPhase — tricks inputs`:
  - `tricks inputs are visible in playing phase`
  - `tricks inputs are pre-filled with bid values`
  - `shows error when total tricks ≠ cardsPerPlayer`
  - `Finalizar Rodada button advances to bid phase when tricks total is correct`
- Add: `result phase is not rendered when phase === "result"` (confirms removal from normal flow) — or simply remove result-phase test coverage since it's no longer a user-facing state

**Dependencies:** SPEC-021 (playing + result phases both already have `isDealer`/`isFirstBidder` wired); `BidInput` reuse; `confirmResult` already in store

---

### Sprint 11: Extend Dealer Toggle to Bids and Playing Phases (SPEC-023)

#### SPEC-023 — Extend Dealer Toggle Visibility to Bids and Playing Phases

**Goal:** Show the dealer change button ("Toque para alterar" / "Editar distribuidor") during `bidSubPhase = 'bids'` for ALL rounds (not just round 2+), and also add it to the playing phase. After any manual change, `dealerIndex` is updated and the next-round rotation derives from the new value. No store changes needed — `confirmDealer()` already updates `dealerIndex` correctly from any phase.

**Files to modify:**

`src/pages/GameRoundPage.tsx` — `BidPhase` function
- Remove the `{round >= 2 && (` guard around the "Editar distribuidor" button (currently lines 123–131).
- The button calls `editDealer()` (no change), which transitions `bidSubPhase` to `'dealer'` so the full `DealerSelectionStep` is shown.
- Result: round 1 users can now tap "Editar distribuidor" to change the dealer before entering bids.

`src/pages/GameRoundPage.tsx` — `PlayingPhase` function
- Add `confirmDealer` to store subscriptions: `const confirmDealer = useGameStore(s => s.confirmDealer);`
- Add local state: `const [isEditingDealer, setIsEditingDealer] = useState(false);`
- Import `DealerSelectionStep` (already imported at the file level via `@/components`).
- In the player list section, add a "Toque para alterar" button next to the "Acertos da rodada" header:
  ```tsx
  <div className="flex items-center justify-between mb-2">
    <h2 className="font-semibold text-slate-300 text-sm">Acertos da rodada</h2>
    <button
      onClick={() => setIsEditingDealer(true)}
      className="text-xs text-slate-500 hover:text-slate-300 underline"
    >
      Toque para alterar distribuidor
    </button>
  </div>
  ```
- When `isEditingDealer === true`, replace the player list with `DealerSelectionStep` inline:
  ```tsx
  {isEditingDealer ? (
    <DealerSelectionStep
      players={alive}
      dealerIndex={state.dealerIndex}
      onConfirm={(overrideDealerIndex) => {
        confirmDealer(overrideDealerIndex);
        setIsEditingDealer(false);
      }}
    />
  ) : (
    <div className="space-y-2">
      {/* existing player map */}
    </div>
  )}
  ```
- The timer continues running during dealer selection (no timer interactions needed).
- After confirming, `isEditingDealer` is reset to `false` and the player list re-appears with updated `isDealer`/`isFirstBidder` labels.

**Tests (`src/pages/__tests__/GameRoundPage.test.tsx`):**

Update describe block `BidPhase — edit dealer button`:
- Update test `'does not show "Editar distribuidor" button in round 1 bids sub-phase'` → change to assert it IS shown: `expect(screen.getByText('Editar distribuidor')).toBeInTheDocument();`

Add describe block `PlayingPhase — dealer toggle`:
- `'shows dealer change button in playing phase'`: renders, assert button with text matching `/alterar distribuidor/i` is in document
- `'clicking dealer change button shows DealerSelectionStep in playing phase'`: click button, assert "Quem distribui as cartas?" is in document
- `'confirming dealer change in playing phase updates dealer labels'`: spy on `confirmDealer`, click button, click new dealer player, click "Confirmar", assert spy was called with the index

**`docs/business-rules.md`:**
- Update RN-017: Remove the sentence "Na rodada 1, o distribuidor não pode ser alterado (apenas confirmado). A partir da rodada 2, há opção de alterar quem distribui." Replace with: "Em todas as rodadas, há opção de alterar quem distribui, tanto na etapa de confirmação do distribuidor quanto durante a fase de palpites e a fase de jogo (enquanto a rodada está em andamento)."
- Add RN-022:

```markdown
### RN-022: Alteração do distribuidor durante a fase de palpites e de jogo (Modo 1)

- **Descrição**: O distribuidor pode ser alterado manualmente durante a fase de palpites (sub-fase de palpites, quando o botão "Iniciar Rodada" está visível) e durante a fase de jogo (rodada em andamento).
- **Comportamento esperado**: Ao alterar o distribuidor, os marcadores "Distribui" e "Primeiro palpite" são atualizados imediatamente. O índice do distribuidor (`dealerIndex`) é persistido, e a rotação automática da rodada seguinte deriva do novo distribuidor.
- **Exceções**: A fase de jogo não é interrompida — o cronômetro continua e as entradas de vazas são preservadas durante a alteração do distribuidor.
```

**`docs/e2e-test-scenarios.md`:**
- Add E2E-022: Alteração do distribuidor na fase de palpites — rodada 1 (validates that round 1 restriction is removed)
- Add E2E-023: Alteração do distribuidor durante a fase de jogo (validates playing-phase dealer change)
- Add E2E-024: Rotação do distribuidor na rodada seguinte após alteração manual (validates rotation derives from updated dealer)

**Dependencies:** SPEC-022 (PlayingPhase and BidPhase must be in their final SPEC-022 form); `DealerSelectionStep` and `confirmDealer` already implemented; no store changes needed.

---

### Sprint 12: Edit Player Order (SPEC-024)

#### SPEC-024 — Edit Player Order Button and Modal

**Goal:** Add an "Editar ordem dos jogadores" button visible alongside the dealer change button during `bidSubPhase = 'bids'` and the playing phase. Tapping it opens a modal where the user can move alive players up or down to change the seating order, then confirm. Confirming updates each player's `position` value, keeps `dealerIndex` pointing to the same player (by identity), and immediately recalculates `firstBidderIndex` so "Primeiro palpite" reflects the new order.

---

**Design decision — `reorderPlayers` implementation:**

- The new action receives an array of alive player IDs in the desired new order.
- It assigns new `position` values `0, 1, 2, …` to those players in that sequence. Dead players are untouched.
- After reassigning positions, it re-derives `dealerIndex` by finding the current dealer's player ID in the new `alivePlayers()` list (sorted by new positions) and updating `dealerIndex` to that index.
- It then recalculates `firstBidderIndex = (newDealerIndex + 1) % newAlive.length` and writes it to `currentRound.firstBidderIndex`.
- No persist version bump is required: `players` (including `position`) and `dealerIndex` are already part of the persisted shape; the shape itself does not change.

---

**Files to create:**

`src/components/PlayerOrderModal.tsx`
- Props: `{ players: Player[]; onConfirm: (orderedIds: string[]) => void; onCancel: () => void }`
- Local state: `const [order, setOrder] = useState<string[]>(players.map(p => p.id))`
- Renders a list of player rows. Each row shows the player's name, plus:
  - An "up" button (▲) — disabled on first row — calls `moveUp(i)` which swaps `order[i]` and `order[i-1]`
  - A "down" button (▼) — disabled on last row — calls `moveDown(i)` which swaps `order[i]` and `order[i+1]`
- Button minimum touch target: `min-h-[44px] min-w-[44px]`
- Modal footer: Confirm button + Cancel button
- Rendered as a fixed overlay (`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4`) with inner card (`bg-slate-800 rounded-2xl p-6 w-full max-w-sm`)

`src/components/__tests__/PlayerOrderModal.test.tsx`
- `renders all alive players in current order`
- `up button disabled on first row`
- `down button disabled on last row`
- `clicking up moves player one position earlier`
- `clicking down moves player one position later`
- `clicking Confirm calls onConfirm with new ordered IDs`
- `clicking Cancel calls onCancel without changing order`
- `moving first player to last position via repeated down clicks`

---

**Files to modify:**

`src/store/gameStore.ts`
- Add `reorderPlayers` to `GameStore` interface:
  ```ts
  reorderPlayers(orderedPlayerIds: string[]): void;
  ```
- Implement the action:
  ```ts
  reorderPlayers(orderedPlayerIds) {
    const { players, dealerIndex, currentRound } = get();
    const alive = alivePlayers(players);
    const dealerPlayer = alive[dealerIndex];

    // Assign new positions to alive players in the given order
    const updatedPlayers = players.map(p => {
      const newPos = orderedPlayerIds.indexOf(p.id);
      if (newPos === -1) return p; // dead player — unchanged
      return { ...p, position: newPos };
    });

    // Re-derive dealerIndex in the new order
    const newAlive = updatedPlayers.filter(p => p.alive).sort((a, b) => a.position - b.position);
    const newDealerIndex = newAlive.findIndex(p => p.id === dealerPlayer?.id);
    const safeDealerIndex = newDealerIndex >= 0 ? newDealerIndex : 0;
    const newFirstBidderIndex = newAlive.length > 0
      ? (safeDealerIndex + 1) % newAlive.length
      : 0;

    set({
      players: updatedPlayers,
      dealerIndex: safeDealerIndex,
      currentRound: currentRound
        ? { ...currentRound, firstBidderIndex: newFirstBidderIndex }
        : null,
    });
  },
  ```
- No persist version bump required: `players`, `dealerIndex`, and `currentRound.firstBidderIndex` are already persisted.

`src/store/__tests__/gameStore.test.ts`
- Add describe block `reorderPlayers`:
  - `updates player positions in the new order`
  - `dealerIndex still points to the same player after reorder`
  - `firstBidderIndex recalculated as player after dealer in new order`
  - `dead players are not affected by reorder`
  - `reorderPlayers is a no-op when the order is unchanged`

`src/components/index.ts`
- Add: `export { PlayerOrderModal } from './PlayerOrderModal';`

`src/pages/GameRoundPage.tsx` — `BidPhase` function
- Add `reorderPlayers` to store subscriptions: `const reorderPlayers = useGameStore(s => s.reorderPlayers);`
- Add local state: `const [isEditingOrder, setIsEditingOrder] = useState(false);`
- Import `PlayerOrderModal` (already re-exported via `@/components`).
- In the `bidSubPhase === 'bids'` section, add the button next to "Editar distribuidor":
  ```tsx
  <div className="flex items-center justify-between">
    <h2 className="font-semibold text-slate-300">Palpites</h2>
    <div className="flex gap-3">
      <button
        onClick={editDealer}
        className="text-xs text-slate-500 hover:text-slate-300 underline"
      >
        Editar distribuidor
      </button>
      <button
        onClick={() => setIsEditingOrder(true)}
        className="text-xs text-slate-500 hover:text-slate-300 underline"
      >
        Editar ordem
      </button>
    </div>
  </div>
  ```
- Render `PlayerOrderModal` when `isEditingOrder === true`:
  ```tsx
  {isEditingOrder && (
    <PlayerOrderModal
      players={alive}
      onConfirm={ids => { reorderPlayers(ids); setIsEditingOrder(false); }}
      onCancel={() => setIsEditingOrder(false)}
    />
  )}
  ```

`src/pages/GameRoundPage.tsx` — `PlayingPhase` function
- Add `reorderPlayers` to store subscriptions: `const reorderPlayers = useGameStore(s => s.reorderPlayers);`
- Add local state: `const [isEditingOrder, setIsEditingOrder] = useState(false);`
- In the "Acertos da rodada" header area, add the button next to "Alterar distribuidor":
  ```tsx
  <div className="flex items-center justify-between mb-2">
    <h2 className="font-semibold text-slate-300 text-sm">Acertos da rodada</h2>
    <div className="flex gap-3">
      <button
        onClick={() => setIsEditingDealer(true)}
        className="text-xs text-slate-500 hover:text-slate-300 underline"
      >
        Alterar distribuidor
      </button>
      <button
        onClick={() => setIsEditingOrder(true)}
        className="text-xs text-slate-500 hover:text-slate-300 underline"
      >
        Editar ordem
      </button>
    </div>
  </div>
  ```
- Render `PlayerOrderModal` as a fixed overlay modal when `isEditingOrder === true`:
  ```tsx
  {isEditingOrder && (
    <PlayerOrderModal
      players={alive}
      onConfirm={ids => { reorderPlayers(ids); setIsEditingOrder(false); }}
      onCancel={() => setIsEditingOrder(false)}
    />
  )}
  ```
- The modal is rendered outside the `isEditingDealer` conditional to avoid interference.

`src/pages/__tests__/GameRoundPage.test.tsx`
- Add describe block `BidPhase — edit order button`:
  - `'shows "Editar ordem" button in bids sub-phase'`
  - `'does not show "Editar ordem" button in manilha sub-phase'`
  - `'does not show "Editar ordem" button in dealer sub-phase'`
  - `'clicking "Editar ordem" opens PlayerOrderModal'`
  - `'cancelling PlayerOrderModal closes it without changing order'`
  - `'confirming PlayerOrderModal calls reorderPlayers and closes modal'`
- Add describe block `PlayingPhase — edit order button`:
  - `'shows "Editar ordem" button in playing phase'`
  - `'clicking "Editar ordem" opens PlayerOrderModal in playing phase'`
  - `'cancelling PlayerOrderModal in playing phase closes it without changing order'`
  - `'confirming PlayerOrderModal in playing phase calls reorderPlayers and closes modal'`

`docs/business-rules.md`
- Add rule:

```markdown
### RN-023: Edição da ordem dos jogadores durante a fase de palpites e de jogo (Modo 1)

- **Descrição**: A ordem dos jogadores pode ser alterada manualmente durante a fase de palpites (sub-fase `bids`, quando o botão "Iniciar Rodada" está visível) e durante a fase de jogo (rodada em andamento).
- **Comportamento esperado**: Ao confirmar a nova ordem, as posições (`position`) dos jogadores vivos são atualizadas. O marcador "Primeiro palpite" é recalculado imediatamente como o jogador vivo imediatamente após o distribuidor na nova ordem. A identidade do distribuidor não muda (o marcador "Distribui" permanece no mesmo jogador).
- **Persistência**: A nova ordem persiste nas rodadas seguintes — a rotação automática do distribuidor segue a nova sequência.
- **Exceções**: Jogadores eliminados não aparecem no modal e não têm sua posição alterada. A fase de jogo não é interrompida — o cronômetro continua e as entradas de vazas são preservadas.
```

`docs/e2e-test-scenarios.md`
- Add E2E-025: Botão "Editar ordem" visível na fase de palpites (sub-fase `bids`) — verifica que o botão aparece ao lado de "Editar distribuidor"
- Add E2E-026: Reordenação de jogadores na fase de palpites — verifica que "Primeiro palpite" atualiza para o jogador após o distribuidor na nova ordem
- Add E2E-027: Reordenação de jogadores durante a fase de jogo — verifica que cronômetro continua, palpites preservados, "Primeiro palpite" atualizado
- Add E2E-028: Ordem dos jogadores persiste na rodada seguinte após alteração manual

**Dependencies:** SPEC-023 (dealer change button in bids and playing phases must already be in place so new button appears alongside it); `confirmDealer` and `alivePlayers` already implemented; no data-model type changes needed.

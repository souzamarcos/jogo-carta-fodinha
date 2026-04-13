# Tasks — Merge Playing and Result Phases in Mode 1 (SPEC-022)

**Feature**: Merge Playing and Result Phases in Mode 1  
**Spec**: `specs/004-merge-playing-result-phases/spec.md`  
**Plan**: `.specify/impl-plan.md` (Sprint 10)  
**Total tasks**: 8  

---

## User Stories

| ID | Story | Spec Ref |
|----|-------|----------|
| US1 | After starting a round, tricks inputs are immediately active and pre-filled with each player's bid value; bids remain visible alongside the inputs | FR-001, FR-002, FR-003, Scenario 1, 2, 5 |
| US2 | "Finalizar Rodada" validates the tricks total and confirms the result directly — timer keeps running until clicked; no separate result screen appears | FR-004, FR-005, FR-006, FR-007, Scenario 3, 4, 6 |

---

## Phase 1 — Foundational (store change)

> Must complete before UI work. Pre-fills tricks in the store so the playing phase renders correct initial values.

- [x] T001 Update `startRound()` in `src/store/gameStore.ts` to set `tricks: { ...currentRound.bids }` when transitioning to the playing phase; bump Zustand persist `version` from `2` to `3` and add a no-op migration entry for `fromVersion < 3`

---

## Phase 2 — User Story 1: Active tricks inputs during playing phase

> **Story goal**: A user who starts a round sees editable tricks inputs immediately, pre-filled with the bid values they just entered. The bid value remains visible as a read-only label.

**Independent test criteria**:
- When `phase === 'playing'` and `currentRound.tricks` contains values matching the bids, each player row renders a `BidInput` component whose value equals that player's bid
- The read-only bid label (`palpite: N`) is visible on each player row alongside the tricks input
- Changing a tricks input calls `setTricks` and clears any existing error message

- [x] T002 [US1] Add `setTricks` and `confirmResult` store subscriptions to `PlayingPhase` in `src/pages/GameRoundPage.tsx`; add `const [tricksError, setTricksError] = useState<string | null>(null)` local state; compute `const totalTricks = alive.reduce((sum, p) => sum + (currentRound?.tricks[p.id] ?? 0), 0)` and `const tricksMismatch = totalTricks !== cardsPerPlayer`

- [x] T003 [P] [US1] Replace the read-only bid display in the `PlayingPhase` player list (`src/pages/GameRoundPage.tsx`) with a two-part row: a read-only bid label `<span className="text-xs text-slate-400">palpite: {bid}</span>` and a tricks `<BidInput value={currentRound?.tricks[player.id] ?? 0} max={cardsPerPlayer} onChange={v => { setTricks(player.id, v); setTricksError(null); }} />`; render `{tricksError && <p className="text-yellow-400 text-xs mb-2">{tricksError}</p>}` below the player list

---

## Phase 3 — User Story 2: Result phase elimination and Finalizar Rodada as confirm

> **Story goal**: "Finalizar Rodada" validates the tricks total and calls `confirmResult()` directly. The dedicated result phase screen no longer appears in the Mode 1 flow.

**Independent test criteria**:
- Clicking "Finalizar Rodada" with a valid tricks total (totalTricks === cardsPerPlayer) transitions the game to the bid phase of the next round without showing a result phase screen
- Clicking "Finalizar Rodada" with an invalid total displays the error string `⚠️ Total de vazas (N) ≠ cartas por jogador (M)` and does not advance the game
- `phase === 'result'` no longer renders any UI in `GameRoundPage`

- [x] T004 [US2] Replace `endRound` with a `handleFinish` function in `PlayingPhase` (`src/pages/GameRoundPage.tsx`): `function handleFinish() { if (tricksMismatch) { setTricksError(\`⚠️ Total de vazas (\${totalTricks}) ≠ cartas por jogador (\${cardsPerPlayer})\`); return; } confirmResult(); }` — update the "Finalizar Rodada" button `onClick` to `handleFinish` and remove the `disabled` prop; remove the `endRound` store subscription

- [x] T005 [P] [US2] Remove the `{phase === 'result' && <ResultPhase />}` JSX line from the `GameRoundPage` component in `src/pages/GameRoundPage.tsx` and delete the entire `ResultPhase` function from the same file

---

## Phase 4 — Tests (Mandatory — Cobertura de Testes Obrigatória)

- [x] T006 Add a test in `src/store/__tests__/gameStore.test.ts` inside a new `describe('gameStore - startRound', ...)` block: advance two players through `setManilha` + `confirmDealer` + `setBid(p1.id, 1)` + `setBid(p2.id, 0)` + `startRound()`; assert `currentRound?.tricks[p1.id] === 1` and `currentRound?.tricks[p2.id] === 0`

- [x] T007 [P] Update `src/pages/__tests__/GameRoundPage.test.tsx`: (a) Update `makeRound()` helper to add `tricks: { alice: 1, bob: 0 }` as default (matching the default bids); (b) Remove the entire `describe('ResultPhase — dealer labels', ...)` block; (c) Add a new `describe('PlayingPhase — tricks inputs', ...)` block with four tests: tricks `BidInput` is rendered for each alive player in playing phase; each tricks input value equals the player's bid from `makeRound()`; clicking "Finalizar Rodada" with matching tricks total (1 + 0 = 1 cardsPerPlayer) calls `confirmResult` (use `vi.spyOn` on the store); clicking "Finalizar Rodada" with mismatched total shows the `⚠️ Total de vazas` error text

---

## Phase 5 — Documentation (Mandatory — Constitution Principles 4 & 5)

- [x] T008 [P] Update `docs/business-rules.md` to replace the Mode 1 round flow description: the flow is now `bid → playing (tricks editable, timer running) → bid (next round)` — remove all references to a separate result phase step; add a rule describing that tricks inputs are pre-filled with bid values when the round starts

- [x] T009 [P] Update `docs/e2e-test-scenarios.md`: update the existing playing → result → confirm scenario to reflect the merged flow (single "Finalizar Rodada" click); add two new scenarios — (a) tricks inputs visible and pre-filled with bids in playing phase; (b) "Finalizar Rodada" blocked with error when tricks total is wrong, succeeds when correct

---

## Dependency Graph

```
T001 (store: pre-fill tricks)
  └─► T002 (PlayingPhase: add state + derived values)
        └─► T003 (PlayingPhase: render tricks inputs)  [P with T004 after T002]
        └─► T004 (PlayingPhase: handleFinish button)   [P with T003 after T002]
  └─► T005 (remove ResultPhase rendering)              [P with T002, T003, T004]

T001 + T002..T005 done
  └─► T006 (store test: pre-fill)                     [P with T007]
  └─► T007 (UI test: playing phase tricks)             [P with T006]
  └─► T008 (docs: business-rules)                      [P with T006, T007, T009]
  └─► T009 (docs: e2e-scenarios)                       [P with T006, T007, T008]
```

---

## Parallel Execution Examples

**After T001 is done**, T002 and T005 can be started in parallel:
- Agent A: T002 → T003 → T004 (PlayingPhase state + UI + button)
- Agent B: T005 (remove ResultPhase)

**After T002–T005 are done**, T006–T009 can all run in parallel:
- Agent A: T006 (store tests)
- Agent B: T007 (UI tests)
- Agent C: T008 (business rules)
- Agent D: T009 (E2E scenarios)

---

## Implementation Strategy

**MVP scope** (minimum viable delivery): T001 + T002 + T003 + T004 + T005 — this fully merges the phases and is observable in the browser.

**Complete delivery**: All 9 tasks including tests and docs (required for PR merge per constitution).

**Suggested execution order for a single agent**: T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009

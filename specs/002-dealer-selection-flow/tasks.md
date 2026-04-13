# Tasks — Dealer Selection Flow and Player Order Stabilization

**Feature**: SPEC-020
**Spec**: [spec.md](./spec.md)
**Plan**: [.specify/impl-plan.md](../../.specify/impl-plan.md)
**Generated**: 2026-04-13

---

## User Stories

| ID | Story | Scenarios | FRs |
|----|-------|-----------|-----|
| US1 | Hide palpite until manilha selected, then show dealer step, then bids | S1, S2, S3 | FR-001, FR-002 |
| US2 | Dealer and first-bidder persistent labels visible on player names in all phases | S2, S3, S4 | FR-003, FR-004 |
| US3 | Player list always in registration order across all phases | S4 | FR-005 |
| US4 | Automatic circular dealer rotation per round + manual correction from round 2 | S5, S6, S7, S8 | FR-006, FR-007, FR-008 |

---

## Phase 1 — Foundational: Store & Utils Changes

> Blocking prerequisites for all user stories. Must complete before any UI work.

### Store: BidSubPhase type and RoundState update

- [ ] T001 Add `BidSubPhase` type (`'manilha' | 'dealer' | 'bids'`) and `bidSubPhase: BidSubPhase` field to `RoundState` interface in `src/store/gameStore.ts`. Also change `manilha` field type from `Card` to `Card | null` (null until selected) in `RoundState`.

- [ ] T002 Update `startGame()` action in `src/store/gameStore.ts`: set `dealerIndex = 0` (first player in registration order); initialize `currentRound` with `bidSubPhase: 'manilha'` and `manilha: null`.

- [ ] T003 Update `setManilha(card)` action in `src/store/gameStore.ts`: after storing `card` on `currentRound.manilha`, also set `currentRound.bidSubPhase = 'dealer'`.

- [ ] T004 Add `confirmDealer(overrideDealerIndex?: number): void` action to `src/store/gameStore.ts`. Preconditions: `phase === 'bid'` and `currentRound.bidSubPhase === 'dealer'`. Effects: if `overrideDealerIndex` is provided, set `state.dealerIndex = overrideDealerIndex`; recalculate `currentRound.firstBidderIndex = (state.dealerIndex + 1) % alivePlayers().length`; set `currentRound.bidSubPhase = 'bids'`.

- [ ] T005 Update `confirmResult()` in `src/store/gameStore.ts`: when advancing to next round (not tiebreak, not finished), initialize the new `currentRound` with `bidSubPhase: 'manilha'` and `manilha: null`.

- [ ] T006 Update `startTiebreakRound()` and `rematch()` in `src/store/gameStore.ts` to initialize `currentRound` with `bidSubPhase: 'manilha'` and `manilha: null`.

- [ ] T007 Bump Zustand `persist` version from 1 to 2 in `src/store/gameStore.ts` and add a `migrate` function that sets `bidSubPhase: 'bids'` and keeps `manilha` as-is for any state persisted at version 1 (so in-progress games loaded from old localStorage resume at the bids step rather than crashing).

### Utils: dealer and first-bidder helpers

- [ ] T008 [P] Add `getDealerId(state: GameState): string | null` and `getFirstBidderId(state: GameState): string | null` helpers to `src/utils/gameUtils.ts`. `getDealerId` returns `alivePlayers(state)[state.dealerIndex]?.id ?? null`. `getFirstBidderId` returns `alivePlayers(state)[(state.dealerIndex + 1) % alivePlayers(state).length]?.id ?? null`.

### Tests: store transitions

- [ ] T009 [P] Add unit tests for `bidSubPhase` transitions in `src/store/__tests__/gameStore.test.ts`:
  - `startGame()` sets `bidSubPhase = 'manilha'` and `manilha = null`
  - `setManilha(card)` transitions `bidSubPhase` to `'dealer'`
  - `confirmDealer()` with no override transitions to `'bids'` and recalculates `firstBidderIndex`
  - `confirmDealer(overrideIndex)` updates `dealerIndex` then transitions to `'bids'`
  - `confirmResult()` advancing to next round resets `bidSubPhase` to `'manilha'`
  - `startTiebreakRound()` sets `bidSubPhase = 'manilha'`

- [ ] T010 [P] Add unit tests for `getDealerId` and `getFirstBidderId` in `src/utils/__tests__/gameUtils.test.ts`:
  - Returns correct id with all players alive
  - Skips dead players in first-bidder derivation (dealer at last alive player → first bidder wraps to first alive)
  - Returns null when no alive players remain

---

## Phase 2 — US1: Bid Sub-Phase UI Flow

> Goal: user cannot enter bids before manilha is selected; dealer confirmation step gates the palpite inputs.
> Independent test: Starting a new round, the bid inputs are not visible; after selecting manilha the dealer step appears; after confirming dealer the bid inputs appear.

### PlayerCard: dealer and first-bidder label props

- [ ] T011 Add `isDealer?: boolean` and `isFirstBidder?: boolean` props to `src/components/PlayerCard.tsx`. When `isDealer` is true, render a persistent `<span>` label with text `"Distribui"` (e.g. `text-xs text-slate-400` style). When `isFirstBidder` is true, render a persistent `<span>` label with text `"Primeiro palpite"`. Both labels must be visible simultaneously when both props are true (edge case).

### DealerSelectionStep component

- [ ] T012 Create `src/components/DealerSelectionStep.tsx`. Props: `players: Player[]` (alive, in registration order), `dealerIndex: number`, `round: number`, `onConfirm: (overrideDealerIndex?: number) => void`. Behavior:
  - Renders all alive players using `PlayerCard` with `isDealer` and `isFirstBidder` set based on current (or locally-selected) `dealerIndex`.
  - Round 1 (`round === 1`): shows pre-selected dealer with `isDealer` label; shows only a "Confirmar" button that calls `onConfirm()` with no argument.
  - Round 2+ (`round >= 2`): shows pre-selected dealer; shows an "Alterar" / edit control (e.g. tapping a player row selects them as dealer); selecting a different player immediately updates local state and re-renders `isDealer`/`isFirstBidder` labels for live preview; "Confirmar" button calls `onConfirm(selectedLocalIndex)`.

### BidPhase: sub-phase rendering

- [ ] T013 Update the `BidPhase` component in `src/pages/GameRoundPage.tsx`:
  - Replace the `ordered` array (which rotated players by first-bidder index) with a stable `alive` array sorted by `position` ascending.
  - Conditional rendering based on `currentRound.bidSubPhase`:
    - `'manilha'`: render only the manilha selector section; hide bid inputs; hide dealer step.
    - `'dealer'`: render manilha display (confirmed, read-only); render `<DealerSelectionStep>` with `onConfirm` calling `confirmDealer()`; hide bid inputs.
    - `'bids'`: render manilha display (confirmed, read-only); render bid inputs in stable registration order; pass `isDealer` and `isFirstBidder` to each `PlayerCard`.
  - The "Iniciar Rodada" button remains disabled until all bids are entered AND `bidSubPhase === 'bids'`.

### Tests: bid sub-phase UI

- [ ] T014 [P] [US1] Add component/integration tests for bid sub-phase rendering in `src/pages/__tests__/GameRoundPage.test.tsx` (or equivalent):
  - When `bidSubPhase === 'manilha'`: bid inputs are not in the DOM; `DealerSelectionStep` is not in the DOM.
  - When `bidSubPhase === 'dealer'`: `DealerSelectionStep` is rendered; bid inputs are not in the DOM.
  - When `bidSubPhase === 'bids'`: bid inputs are rendered for each alive player; `DealerSelectionStep` is not rendered.
  - "Iniciar Rodada" button is disabled when `bidSubPhase !== 'bids'`.

- [ ] T015 [P] [US1] Add tests for `DealerSelectionStep` in `src/components/__tests__/DealerSelectionStep.test.tsx`:
  - Round 1: no edit/change control rendered; confirm button present.
  - Round 2+: edit/change control rendered; confirm button present.
  - Calling confirm (round 1) invokes `onConfirm` with no arguments.
  - Selecting a different player (round 2+) then confirming invokes `onConfirm(newIndex)`.

- [ ] T016 [P] [US1] Add tests for `PlayerCard` label rendering in `src/components/__tests__/PlayerCard.test.tsx`:
  - `isDealer=true` renders text "Distribui".
  - `isFirstBidder=true` renders text "Primeiro palpite".
  - Both labels rendered simultaneously when both props are true.
  - Neither label rendered when both props are false/undefined.

---

## Phase 3 — US2 + US3: Persistent Labels and Stable Order in All Phases

> Goal: "Distribui" and "Primeiro palpite" labels remain visible through playing and result phases; player row order never changes.
> Independent test: After confirming dealer and starting the round, the playing and result phase player lists still show the correct labels and same player order as the bid phase.

- [ ] T017 [US2] [US3] Update `PlayingPhase` component in `src/pages/GameRoundPage.tsx`: render the alive player list in registration order (sorted by `position`); pass `isDealer` (derived from `getDealerId`) and `isFirstBidder` (derived from `getFirstBidderId`) to each `PlayerCard`.

- [ ] T018 [P] [US2] [US3] Update `ResultPhase` component in `src/pages/GameRoundPage.tsx`: render the alive player list in registration order (sorted by `position`); pass `isDealer` and `isFirstBidder` to each `PlayerCard`.

- [ ] T019 [P] [US2] [US3] Add tests verifying stable order and persistent labels across phase transitions in `src/pages/__tests__/GameRoundPage.test.tsx`:
  - Player rows appear in the same order in bid (`bidSubPhase === 'bids'`), playing, and result phases.
  - "Distribui" label present on dealer's row in playing phase.
  - "Primeiro palpite" label present on first-bidder's row in playing phase.
  - "Distribui" label present on dealer's row in result phase.
  - "Primeiro palpite" label present on first-bidder's row in result phase.

---

## Phase 4 — US4: Automatic Dealer Rotation and Manual Correction

> Goal: dealer index advances automatically each round skipping dead players; edit is available from round 2.
> Independent test: After round 1 completes, the dealer step in round 2 pre-selects the next alive player; after manually changing it and confirming, subsequent round uses the corrected dealer as base for next rotation.

- [ ] T020 [US4] Verify `confirmResult()` in `src/store/gameStore.ts` advances `dealerIndex` by 1 (circularly among alive players) when initializing the next round. This should already happen if `confirmResult` was previously advancing `dealerIndex` — confirm the logic survives the SPEC-020 refactor and works correctly when dead players are skipped.

- [ ] T021 [P] [US4] Add store tests for dealer rotation in `src/store/__tests__/gameStore.test.ts`:
  - After round 1 `confirmResult()`, new round's `dealerIndex` is `(prev + 1) % alivePlayers().length`.
  - If a player between positions dies, the rotation skips them: run two rounds, eliminate mid-list player, verify next dealer is correct alive player.
  - After `confirmDealer(overrideIndex)`, the *next* round's dealer starts from the overridden index + 1.
  - Rotation wraps: last alive player as dealer → first alive player becomes next dealer.

- [ ] T022 [P] [US4] Add integration tests for the dealer selection UI (round 1 vs round 2+) in `src/components/__tests__/DealerSelectionStep.test.tsx`:
  - Round 1: no edit control; pre-selected dealer matches `dealerIndex` prop.
  - Round 2: edit control visible; tapping a different player row updates the `isDealer` and `isFirstBidder` labels before confirmation.
  - Live preview: selecting player B as dealer (instead of pre-selected A) immediately shows "Distribui" on B and "Primeiro palpite" on the player after B.

---

## Phase 5 — Polish & Cross-Cutting

> Integration, edge cases, and constitution compliance.

- [ ] T023 Verify the Zustand persist migration (T007) works end-to-end: manually set `localStorage` with a version-1 state snapshot (where `bidSubPhase` is absent), reload the store, and confirm the migrated state has `bidSubPhase: 'bids'` so no crash occurs in `src/store/__tests__/gameStore.test.ts`.

- [ ] T024 [P] Add an E2E scenario to `docs/e2e-test-scenarios.md` documenting the full SPEC-020 flow: manilha selection → dealer step (round 1, no edit) → bids → round 2 dealer step (with edit option) → dealer change → confirm → stable player order across phases.

- [ ] T025 [P] Update `docs/business-rules.md` to document: (a) dealer rotation rule — next alive player in circular registration order; (b) bidSubPhase gate — palpite inputs only visible after dealer confirmed; (c) round 1 restriction — dealer cannot be changed in round 1.

---

## Dependency Graph

```
T001 (RoundState type update)
  └─► T002, T003, T004, T005, T006, T007 (store actions)
        └─► T008 (gameUtils helpers)                [P with T009]
        └─► T009 (store tests)                      [P with T008]
        └─► T010 (gameUtils tests)                  [P with T009]
              └─► T011 (PlayerCard label props)
                    └─► T012 (DealerSelectionStep)
                          └─► T013 (BidPhase sub-phase rendering)
                                └─► T014 (BidPhase tests) [P]
                                └─► T015 (DealerSelectionStep tests) [P]
                                └─► T016 (PlayerCard tests) [P]
                                      └─► T017 (PlayingPhase order + labels)
                                      └─► T018 (ResultPhase order + labels) [P]
                                            └─► T019 (phase transition tests) [P]
                                            └─► T020 (verify dealer rotation in confirmResult)
                                                  └─► T021 (rotation tests) [P]
                                                  └─► T022 (dealer UI tests) [P]
                                                        └─► T023 (persist migration test)
                                                        └─► T024 (E2E scenario doc) [P]
                                                        └─► T025 (business rules doc) [P]
```

## Parallel Execution Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| Store + Utils tests | T008, T009, T010 | After T001–T007 complete |
| Component tests | T014, T015, T016 | After T011–T013 complete |
| Phase tests | T018, T019 | After T017 starts; T018 is parallel to T017 |
| Rotation tests | T021, T022 | After T020 |
| Docs | T024, T025 | After T020–T022 |

## Implementation Strategy

**MVP (minimum to unblock QA)**:
- T001–T007 (store), T008 (utils), T011 (PlayerCard), T012 (DealerSelectionStep), T013 (BidPhase rendering)

**Then stabilize with tests**: T009, T010, T014, T015, T016

**Then complete remaining phases**: T017–T025

---

## Task Count Summary

| Phase | Tasks | Notes |
|---|---|---|
| Phase 1 — Foundation | T001–T010 | 10 tasks; 4 parallelizable |
| Phase 2 — US1 Bid Flow | T011–T016 | 6 tasks; 3 parallelizable |
| Phase 3 — US2+US3 Labels/Order | T017–T019 | 3 tasks; 2 parallelizable |
| Phase 4 — US4 Rotation | T020–T022 | 3 tasks; 2 parallelizable |
| Phase 5 — Polish | T023–T025 | 3 tasks; 2 parallelizable |
| **Total** | **25 tasks** | 13 parallelizable |

## Constitution Compliance

| Principle | Status |
|---|---|
| Cobertura de Testes Obrigatória | ✅ Every implementation task has a corresponding test task |
| DRY | ✅ `getDealerId`/`getFirstBidderId` helpers reused across BidPhase/PlayingPhase/ResultPhase |
| README Completo | ✅ No README changes required (feature is internal game flow) |
| Regras de Negócio Documentadas | ✅ T025 updates `docs/business-rules.md` |
| Cenários de Teste E2E Documentados | ✅ T024 adds SPEC-020 flow to `docs/e2e-test-scenarios.md` |

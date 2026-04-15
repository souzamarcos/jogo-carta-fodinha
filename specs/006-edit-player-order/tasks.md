# Tasks — Edit Player Order (SPEC-024)

**Feature**: Edit Player Order
**Spec**: [spec.md](./spec.md)
**Generated**: 2026-04-14
**Branch**: `claude/trusting-gagarin`

---

## User Stories

| ID | Priority | Description |
|----|----------|-------------|
| US1 | P1 | As a player, I can reorder alive players during the bids entry phase so that "Primeiro palpite" reflects the correct seating order |
| US2 | P2 | As a player, I can reorder alive players during the playing phase without interrupting the round in progress |
| US3 | P3 | As a player, the updated player order persists into subsequent rounds so dealer rotation follows the new seating |

---

## Implementation Strategy

MVP = US1 (bids phase button + modal + store action). US2 adds the same modal to the playing phase. US3 is implicit once the store action writes `position` values correctly (no extra work).

**Delivery order**: Phase 2 (store) → Phase 3 (modal component) → Phase 4 (bids phase integration — US1) → Phase 5 (playing phase integration — US2) → Phase 6 (polish)

---

## Phase 1 — Setup

> No project initialization needed. SPEC-024 builds entirely on the existing codebase.

---

## Phase 2 — Foundational: Store Action

> Blocking prerequisite for all user stories. Adds `reorderPlayers` to `gameStore` and its tests.

- [x] T001 Add `reorderPlayers(orderedPlayerIds: string[]): void` action to `GameStore` interface and implement it in `src/store/gameStore.ts` — reassigns `position` values (0-based) to alive players in the given ID order; dead players untouched; re-derives `dealerIndex` by finding the current dealer's ID in the new sorted `alivePlayers()` list; recalculates `currentRound.firstBidderIndex = (newDealerIndex + 1) % newAlive.length`; no phase transition; no persist version bump
- [x] T002 [P] Add `reorderPlayers` test suite to `src/store/__tests__/gameStore.test.ts`: `updates player positions in the new order`, `dealerIndex still points to the same player after reorder`, `firstBidderIndex recalculated as player after dealer in new order`, `dead players are not affected by reorder`, `reorderPlayers is a no-op when order is unchanged`

---

## Phase 3 — Foundational: PlayerOrderModal Component

> Blocking prerequisite for US1 and US2. Creates the reorder modal and its tests.

- [x] T003 Create `src/components/PlayerOrderModal.tsx` — fixed overlay modal (`fixed inset-0 bg-black/80 z-50`), inner card (`bg-slate-800 rounded-2xl p-6 w-full max-w-sm`); props: `{ players: Player[]; onConfirm: (orderedIds: string[]) => void; onCancel: () => void }`; local state `order: string[]` initialised from `players.map(p => p.id)`; renders a list of rows, each showing player name + ▲ up button (disabled on first row, `min-h-[44px] min-w-[44px]`) + ▼ down button (disabled on last row); Confirm button calls `onConfirm(order)`; Cancel button calls `onCancel`; up/down swap adjacent elements in `order` state
- [x] T004 Export `PlayerOrderModal` from `src/components/index.ts`
- [x] T005 [P] Create `src/components/__tests__/PlayerOrderModal.test.tsx`: `renders all alive players in current order`, `up button disabled on first row`, `down button disabled on last row`, `clicking up moves player one position earlier`, `clicking down moves player one position later`, `clicking Confirm calls onConfirm with new ordered IDs`, `clicking Cancel calls onCancel without changing order`

---

## Phase 4 — US1: Edit Order Button in Bids Phase

> Story goal: User sees "Editar ordem" button during `bidSubPhase = 'bids'` and can reorder players before starting the round.
>
> Independent test: render `GameRoundPage` in bids sub-phase → "Editar ordem" button present; click it → `PlayerOrderModal` appears; confirm → `reorderPlayers` called; cancel → modal closes with original order intact.

- [x] T006 [US1] Update `BidPhase` in `src/pages/GameRoundPage.tsx`: add `const reorderPlayers = useGameStore(s => s.reorderPlayers);` and `const [isEditingOrder, setIsEditingOrder] = useState(false);`; in the `bidSubPhase === 'bids'` section replace the `<h2>` + single "Editar distribuidor" button row with a `<div className="flex items-center justify-between">` containing the heading and a `<div className="flex gap-3">` holding both buttons ("Editar distribuidor" + "Editar ordem"); add `{isEditingOrder && <PlayerOrderModal players={alive} onConfirm={ids => { reorderPlayers(ids); setIsEditingOrder(false); }} onCancel={() => setIsEditingOrder(false)} />}` inside the bids section
- [x] T007 [P] [US1] Add tests to `src/pages/__tests__/GameRoundPage.test.tsx` for bids phase: `shows "Editar ordem" button in bids sub-phase`, `does not show "Editar ordem" button in manilha sub-phase`, `does not show "Editar ordem" button in dealer sub-phase`, `clicking "Editar ordem" opens PlayerOrderModal`, `cancelling PlayerOrderModal closes it without changing order`, `confirming PlayerOrderModal calls reorderPlayers and closes modal`

---

## Phase 5 — US2 & US3: Edit Order Button in Playing Phase + Round Persistence

> Story goal (US2): User sees "Editar ordem" button during the playing phase; modal opens without stopping the timer; bids, tricks, and timer are all preserved after confirm or cancel.
> Story goal (US3): After a round ends, the next round's player list and dealer rotation use the updated order automatically (validated by store action already writing `position` correctly — covered by Phase 2 tests).
>
> Independent test: render `GameRoundPage` in playing phase → "Editar ordem" button present; confirm reorder → `reorderPlayers` called, "Primeiro palpite" label moves to correct player; timer continues (not reset); tricks inputs retain values.

- [x] T008 [US2] Update `PlayingPhase` in `src/pages/GameRoundPage.tsx`: add `const reorderPlayers = useGameStore(s => s.reorderPlayers);` and `const [isEditingOrder, setIsEditingOrder] = useState(false);`; replace the "Acertos da rodada" header row with a `<div className="flex items-center justify-between mb-2">` holding both action buttons ("Alterar distribuidor" + "Editar ordem") inside a `<div className="flex gap-3">`; add `{isEditingOrder && <PlayerOrderModal players={alive} onConfirm={ids => { reorderPlayers(ids); setIsEditingOrder(false); }} onCancel={() => setIsEditingOrder(false)} />}` outside the `isEditingDealer` conditional
- [x] T009 [P] [US2] Add tests to `src/pages/__tests__/GameRoundPage.test.tsx` for playing phase: `shows "Editar ordem" button in playing phase`, `clicking "Editar ordem" opens PlayerOrderModal in playing phase`, `cancelling PlayerOrderModal in playing phase closes it without changing order`, `confirming PlayerOrderModal in playing phase calls reorderPlayers and closes modal`

---

## Phase 6 — Polish & Cross-Cutting Concerns

- [x] T010 [P] Add `RN-023` to `docs/business-rules.md`: "Edição da ordem dos jogadores durante a fase de palpites e de jogo (Modo 1)" — describe `reorderPlayers` behaviour, "Primeiro palpite" recalculation, dead players excluded, timer/bids/tricks preserved
- [x] T011 [P] Add E2E scenarios E2E-025 through E2E-028 to `docs/e2e-test-scenarios.md`: button visible in bids phase, reorder in bids phase updates "Primeiro palpite", reorder in playing phase preserves timer and tricks, order persists into next round rotation

---

## Dependency Graph

```
T001 (reorderPlayers store action)
  └─► T002 (store tests)          [parallel with T003..T005]
T003 (PlayerOrderModal component)
  └─► T004 (export from index)
  └─► T005 (component tests)      [parallel with T002]
T001 + T003 + T004
  └─► T006 (BidPhase integration — US1)
        └─► T007 (BidPhase tests)  [parallel with T006]
T001 + T003 + T004
  └─► T008 (PlayingPhase integration — US2)
        └─► T009 (PlayingPhase tests) [parallel with T008]
T010 + T011 — parallel with any phase, no code dependencies
```

---

## Parallel Execution Examples

**Round 1 (store + component — no dependencies between them):**
- Agent A: T001 + T002 (store action + tests)
- Agent B: T003 + T004 + T005 (component + export + tests)

**Round 2 (integration — after T001, T003, T004):**
- Agent A: T006 + T007 (BidPhase)
- Agent B: T008 + T009 (PlayingPhase)
- Agent C: T010 + T011 (docs — independent)

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| 2 — Store Action | T001, T002 | Foundation |
| 3 — Modal Component | T003, T004, T005 | Foundation |
| 4 — Bids Phase | T006, T007 | US1 (P1) |
| 5 — Playing Phase | T008, T009 | US2 (P2) / US3 (P3) |
| 6 — Polish | T010, T011 | Cross-cutting |

**Total: 11 tasks**

**MVP scope**: T001 → T002 → T003 → T004 → T005 → T006 → T007 (US1 complete)

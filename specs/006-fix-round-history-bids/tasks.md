# Tasks — Fix Round History: Missing Bids and Tricks for Zero-Bid Players (SPEC-024)

**Feature**: Fix Round History: Missing Bids and Tricks for Zero-Bid Players
**Spec**: `specs/006-fix-round-history-bids/spec.md`
**Plan**: `.specify/impl-plan.md` (Sprint 12)
**Total tasks**: 5

---

## User Stories

| ID | Story | Spec Ref |
|----|-------|----------|
| US1 | When viewing the round history, every player who was alive during that round shows their actual bid and tricks made — even if they bid 0 by default — so I can accurately review what happened in past rounds | FR-001, FR-002, FR-003, Scenarios 1, 2, 3, 5, 6 |
| US2 | The "–" symbol in the history table is reserved for players who were eliminated before a given round, so I can clearly distinguish participants from non-participants | FR-003, Scenario 2, 7 |

---

## Phase 1 — User Story 1: Complete bid and tricks data stored per round

> **Story goal**: All alive players always have an explicit entry in `bids` and `tricks` before a round begins, so the history entry saved at round end is complete — even for players who kept the default bid of 0.

**Independent test criteria**:
- After calling `startRound()`, `currentRound.bids` contains an entry for every alive player (including those who never called `setBid()`)
- After calling `startRound()`, `currentRound.tricks` is seeded from the normalized bids (every alive player present, matching bids)
- After calling `confirmResult()`, `history[0].bids` and `history[0].tricks` contain entries for all alive players, including those with bid=0

- [x] T001 [US1] Update `startRound()` in `src/store/gameStore.ts` to normalize bids before setting state: retrieve `players` from `get()` alongside `currentRound`, call `alivePlayers(players)`, build `normalizedBids: Record<string, number>` by iterating over alive players and defaulting each to `currentRound.bids[p.id] ?? 0`, then in the `set()` call use `bids: normalizedBids` and `tricks: { ...normalizedBids }` (replacing the current `tricks: { ...currentRound.bids }`)

- [x] T002 [P] [US1] Add tests in `src/store/__tests__/gameStore.test.ts` under a new `describe('gameStore — startRound normalization')` block:
  - `'normalizes bids to include all alive players'`: start 3-player game, advance through setManilha + confirmDealer, call setBid for player 1 only (bid=2), call startRound(); assert currentRound.bids has 3 entries, players 2 and 3 have value 0
  - `'seeds tricks from normalized bids'`: same setup; assert currentRound.tricks equals currentRound.bids (all 3 players present with same values)
  - `'confirmResult stores complete bids and tricks in history'`: complete a full round (startGame → setManilha → confirmDealer → startRound → confirmResult) where one player keeps bid=0; assert history[0].bids and history[0].tricks each contain entries for all 3 players

---

## Phase 2 — User Story 2: "–" shown only for eliminated players

> **Story goal**: The history table correctly distinguishes players who participated with bid=0 (show "0/0") from players who were eliminated before the round (show "–"), using `losses` as the reliable participation signal.

**Independent test criteria**:
- A player with bid=0 and tricks=0 in a history entry renders as "0/0", not "–"
- A player who was eliminated (absent from `losses`) renders as "–"
- The loss indicator (e.g. "-1") still appears correctly for players who lost lives

- [x] T003 [US2] Update the per-player cell rendering in `src/components/RoundHistoryTable.tsx` (line 47): change the participation check from `h.bids[p.id] !== undefined` to `p.id in h.losses` — the `losses` record has always been populated for all alive players (in both old and new persisted data), making it the correct participation signal; the inner span content (`h.bids[p.id]`, `h.tricks[p.id] ?? '?'`, loss indicator) is unchanged

- [x] T004 [P] [US2] Add tests in `src/components/__tests__/RoundHistoryTable.test.tsx` (create file if it doesn't exist) under `describe('RoundHistoryTable — participation display')`:
  - `'shows "0/0" for alive player with bid=0 and tricks=0'`: render with a history entry where `bids[id]=0`, `tricks[id]=0`, `losses[id]=0`; assert cell contains "0/0" and does NOT contain "–"
  - `'shows "–" for eliminated player'`: render with a history entry where player's id is absent from `losses`; assert cell text is "–"
  - `'shows loss indicator for player who lost lives'`: render with `bids[id]=2`, `tricks[id]=0`, `losses[id]=2`; assert "-2" is visible in the cell

---

## Phase 3 — Documentation

> **Story goal**: Business rules and E2E scenarios reflect the corrected history behavior so future contributors understand the data contract.

- [x] T005 [P] [US1] Update `docs/business-rules.md` to add a note stating that `RoundHistory.bids` and `RoundHistory.tricks` always contain an entry for every player alive at the start of the round (value 0 for players who did not explicitly change their bid). Update `docs/e2e-test-scenarios.md` to add scenario E2E-025: "Jogador com palpite 0 — histórico mostra '0/0', não '–'": preconditions (3-player game, one player keeps bid=0), steps (complete 1 round, expand history), expected result (that player's cell shows "0/0", not "–").

---

## Dependency Graph

```
T001 (startRound normalization — data fix)
  └─► T002 (gameStore tests — validates T001)
  └─► T003 (RoundHistoryTable display fix — depends on T001 for correct data)
        └─► T004 (RoundHistoryTable tests — validates T003)
T005 (docs — can run in parallel with any task)
```

US1 (T001, T002) must complete before US2 (T003, T004) for correct end-to-end behavior, though T003 is independently testable with static mock data.

---

## Parallel Execution

**Within US1** (after T001):
- T002 can be written in parallel with T003 since they target different files.

**Within US2** (after T003):
- T004 can be written in parallel with T005.

**Documentation** (T005):
- Can be done at any time, fully independent.

---

## Implementation Strategy

**MVP (minimum to fix the visible bug)**:
1. T001 — fixes the data at source
2. T003 — fixes the display for both new and legacy data

**Full fix**:
3. T002 — unit tests for data fix
4. T004 — unit tests for display fix
5. T005 — documentation

The bug is fully fixed after T001 + T003. Tests and docs are required by the project constitution but do not affect end-user behavior.

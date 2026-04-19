# Tasks — Adjust Player Count During Manilha Selection — Modo 2 (SPEC-026)

**Feature**: Adjust Player Count During Manilha Selection (Modo 2)
**Spec**: [spec.md](./spec.md)
**Research**: [research.md](./research.md)
**Generated**: 2026-04-18
**Branch**: `claude/strange-napier-e018b9`

---

## User Stories

| ID  | Priority | Description |
|-----|----------|-------------|
| US1 | P1 | As a Modo 2 player, I can tap − and + buttons on Etapa 1 to adjust the number of active players before each round so that card calculations reflect eliminations |
| US2 | P2 | As a Modo 2 player, the adjusted player count is used for all card-distribution calculations in the current round and carries forward automatically to the next round without re-entry |

---

## Implementation Strategy

MVP = US1 (store action + UI control). US2 is fully satisfied by the same store action because `finishRound()` already reads `numPlayers` from state — no additional code needed once `updateNumPlayers` writes the value.

**Delivery order**: Phase 2 (store action + tests) → Phase 3 (UI wiring — US1 + US2) → Phase 4 (polish)

---

## Phase 1 — Setup

> No project initialization needed. SPEC-026 builds entirely on the existing `playerHandStore` and `PlayerPage.tsx`.

---

## Phase 2 — Foundational: Store Action

> Blocking prerequisite for all user stories. Adds `updateNumPlayers` to `playerHandStore` and verifies it with unit tests.

- [x] T001 Add `updateNumPlayers(n: number): void` to the `PlayerHandStoreActions` interface and implement it in `src/store/playerHandStore.ts` — clamps input to `[2, 10]` using `Math.min(10, Math.max(2, n))`; sets `numPlayers` to the clamped value; recalculates `cardsPerPlayer = Math.min(round, Math.floor(40 / clamped))` using the current `round` from state; no other state fields are changed; no persist version bump (schema unchanged)
- [x] T002 [P] Add `updateNumPlayers` test suite to `src/store/__tests__/playerHandStore.test.ts` inside a new `describe('playerHandStore — updateNumPlayers', ...)` block: `'reduces numPlayers by 1 and recalculates cardsPerPlayer'` (init 4 players round 2, call updateNumPlayers(3), assert numPlayers===3 and cardsPerPlayer===2); `'increases numPlayers and recalculates cardsPerPlayer'` (init 3 players, call updateNumPlayers(4), assert numPlayers===4); `'clamps to minimum 2'` (call updateNumPlayers(1), assert numPlayers===2); `'clamps to maximum 10'` (call updateNumPlayers(11), assert numPlayers===10); `'at boundary — numPlayers 2 stays at 2'` (call updateNumPlayers(2), assert numPlayers===2); `'does not affect other state fields'` (init session, set manilha, call updateNumPlayers(3), assert manilha and round are unchanged)

---

## Phase 3 — US1 & US2: Player Count Stepper on Etapa 1

> Story goal (US1): Player count control (− / count / +) appears on the ManilhaSetupScreen with correct touch targets; tapping adjusts `numPlayers` immediately; bounds prevent values outside 2–10.
>
> Story goal (US2): Card calculations in Etapa 2 and subsequent rounds use the updated `numPlayers`; count persists through `finishRound()` without additional user input.
>
> Independent test: navigate to ManilhaSetupScreen with `numPlayers=4`; assert stepper shows "4"; click "−"; assert display shows "3" and store `numPlayers===3` and `cardsPerPlayer` recalculated; proceed to Etapa 2 and verify `cardsPerPlayer` matches; finish round and re-enter Etapa 1; assert count still shows "3".

- [x] T003 [US1] Update `ManilhaSetupScreen` in `src/pages/PlayerPage.tsx`: add `const updateNumPlayers = usePlayerHandStore(s => s.updateNumPlayers);` to store subscriptions; after the existing subtitle `<p>` element ("Rodada {round} · {numPlayers} jogadores"), insert a `<div className="flex items-center gap-3 mb-4">` stepper containing: a `<span className="text-sm text-slate-400">Jogadores:</span>` label, a `<button onClick={() => updateNumPlayers(numPlayers - 1)} disabled={numPlayers <= 2} className="min-h-[44px] min-w-[44px] bg-slate-700 rounded-xl text-xl font-bold hover:bg-slate-600 active:bg-slate-500 disabled:opacity-40 disabled:pointer-events-none">−</button>`, a `<span className="text-2xl font-mono font-bold w-12 text-center">{numPlayers}</span>`, and a `<button onClick={() => updateNumPlayers(numPlayers + 1)} disabled={numPlayers >= 10} className="min-h-[44px] min-w-[44px] bg-slate-700 rounded-xl text-xl font-bold hover:bg-slate-600 active:bg-slate-500 disabled:opacity-40 disabled:pointer-events-none">+</button>`; no other changes to the file

---

## Phase 4 — Polish & Cross-Cutting Concerns

- [x] T004 [P] Add rule `RN-024` to `docs/business-rules.md`: "Ajuste do número de jogadores no Modo 2 (Etapa 1)" — describe that − and + buttons on Etapa 1 adjust `numPlayers` within bounds [2, 10]; `cardsPerPlayer` is recalculated immediately; the new value persists to future rounds via `finishRound()`; the update does not affect prior round history
- [x] T005 [P] Add E2E scenario `E2E-029` to `docs/e2e-test-scenarios.md`: preconditions (Modo 2 session active, 4 players, Etapa 1 visible for round 2); steps (assert control shows "4"; tap −; assert "3"; select manilha and confirm; verify Etapa 2 card count uses 3 players; finish round; assert Etapa 1 of next round shows "3"); expected result (count reduced, calculations correct, value persists)
- [x] T006 [P] Add E2E test `'E2E-029: adjusting player count on Etapa 1 recalculates cards and persists'` to `tests/e2e/mode2-full.spec.ts`: start Modo 2 with default 4 players; on Etapa 1 click the "−" button; assert the count display shows "3"; select manilha value "A" and click "Confirmar Manilha"; assert Etapa 2 (Sua mão) is visible — confirming the manilha confirmation succeeded with the updated count

---

## Dependency Graph

```
T001 (store action)
  └─► T002 [P] (store tests)
  └─► T003 (UI control — US1 + US2)
        └─► T004 [P] (business rules doc)
        └─► T005 [P] (E2E scenario doc)
        └─► T006 [P] (E2E test)
```

## Parallel Execution

After T001 is complete, T002 and T003 can run in parallel (different files). After T003 is complete, T004, T005, and T006 can all run in parallel (different files).

---

## Summary

| Phase | Tasks | Parallelizable |
|-------|-------|----------------|
| Phase 2 — Store | T001, T002 | T002 after T001 |
| Phase 3 — UI (US1 + US2) | T003 | after T001 |
| Phase 4 — Polish | T004, T005, T006 | all parallel after T003 |

**Total tasks**: 6  
**MVP scope**: T001 + T003 (store action + UI) — delivers US1 and US2 in ~15 min  
**Format validation**: All tasks follow `- [ ] TN [P?] [USN?] Description with file path` ✅

# Tasks — Fix: Dealer Labels Persist Through All Game Phases

**Feature**: SPEC-021
**Spec**: [spec.md](./spec.md)
**Plan**: [.specify/impl-plan.md](../../.specify/impl-plan.md)
**Generated**: 2026-04-13

---

## User Stories

| ID | Story | Scenarios | FRs |
|----|-------|-----------|-----|
| US1 | "Distribui" and "Primeiro palpite" labels visible during playing phase | S1, S3 | FR-001, FR-002 |
| US2 | "Distribui" and "Primeiro palpite" labels visible during result phase | S2, S3 | FR-003, FR-004 |
| US3 | "Editar distribuidor" button visible in bids phase for round 2+ | S4, S5 | FR-005 |

---

## Phase 1 — Foundational

> No foundational changes needed. All helpers (`getDealerId`, `getFirstBidderId`), `PlayerCard` props (`isDealer`, `isFirstBidder`), and the `editDealer` store action are already implemented in SPEC-020. This phase is intentionally empty — proceed directly to user story phases.

---

## Phase 2 — US1: Dealer Labels in Playing Phase

> **Goal**: After clicking "Iniciar Rodada", the dealer's card shows "Distribui" and the first-bidder's card shows "Primeiro palpite" throughout the playing phase.
> **Independent test**: Start a game, complete the bids phase, click "Iniciar Rodada" — the playing phase player list must show "Distribui" on the dealer and "Primeiro palpite" on the first bidder.

- [x] T001 [US1] In the `PlayingPhase` function in `src/pages/GameRoundPage.tsx`: the function already reads `const state = useGameStore(s => s)` and `const alive = ...`. Add `const dealerId = getDealerId(state);` and `const firstBidderId = getFirstBidderId(state);` after the `alive` declaration. Then in the `alive.map(player => ...)` block, update `<PlayerCard key={player.id} player={player}>` to `<PlayerCard key={player.id} player={player} isDealer={player.id === dealerId} isFirstBidder={player.id === firstBidderId && alive.length > 1}>`. No other changes.

- [x] T002 [P] [US1] Create `src/pages/__tests__/GameRoundPage.test.tsx`. Add a `describe('PlayingPhase — dealer labels')` block. Use `useGameStore.setState(...)` with `beforeEach` reset (`useGameStore.setState({ ...initialGameState, ... }); localStorage.clear();`). Set up a game state with `phase: 'playing'`, two players (Alice pos.0, Bob pos.1), `dealerIndex: 0`, and `currentRound` with `firstBidderIndex: 1`. Render `<GameRoundPage />` wrapped in `<MemoryRouter>`. Assert: text "Distribui" is present in the document; text "Primeiro palpite" is present in the document; "Distribui" is inside the row containing Alice's name; "Primeiro palpite" is inside the row containing Bob's name.

---

## Phase 3 — US2: Dealer Labels in Result Phase

> **Goal**: During the result phase (after "Finalizar Rodada"), both labels remain visible and consistent with the playing phase.
> **Independent test**: Advance the game to result phase — player list must show "Distribui" and "Primeiro palpite" on the same players as in the playing phase.

- [x] T00X [P] [US2] In the `ResultPhase` function in `src/pages/GameRoundPage.tsx`: the function already reads `const state = useGameStore(s => s)` and `const alive = ...`. Add `const dealerId = getDealerId(state);` and `const firstBidderId = getFirstBidderId(state);` after the `alive` declaration. Then in the `alive.map(player => ...)` block, update `<PlayerCard key={player.id} player={player}>` to `<PlayerCard key={player.id} player={player} isDealer={player.id === dealerId} isFirstBidder={player.id === firstBidderId && alive.length > 1}>`. No other changes.

- [x] T00X [P] [US2] In `src/pages/__tests__/GameRoundPage.test.tsx`, add a `describe('ResultPhase — dealer labels')` block. Set up a game state with `phase: 'result'`, two players (Alice pos.0, Bob pos.1), `dealerIndex: 0`, and `currentRound` with `firstBidderIndex: 1`, `bids: { [alice.id]: 1, [bob.id]: 0 }`, `tricks: {}`. Render `<GameRoundPage />` wrapped in `<MemoryRouter>`. Assert: text "Distribui" is present in the document; text "Primeiro palpite" is present in the document; "Distribui" is inside the row containing Alice's name; "Primeiro palpite" is inside the row containing Bob's name.

---

## Phase 4 — US3: Edit Dealer Button Verification

> **Goal**: Confirm the "Editar distribuidor" button is visible in bids sub-phase for round 2+ and absent in round 1.
> **Independent test**: Render BidPhase in bids sub-phase with round=2 — button must be present. Same with round=1 — button must be absent.

- [x] T00X [US3] Verify that `src/pages/GameRoundPage.tsx` `BidPhase` already renders the "Editar distribuidor" button correctly. The existing code at the `{bidSubPhase === 'bids' && ...}` block already has: `{round >= 2 && (<button onClick={editDealer}>Editar distribuidor</button>)}`. No code change is needed — this task is a verification-only task. If the button is missing or the condition is wrong, fix it in this task.

- [x] T00X [P] [US3] In `src/pages/__tests__/GameRoundPage.test.tsx`, add a `describe('BidPhase — edit dealer button')` block with two tests:
  - Test 1 "visible in round 2 bids": state with `phase: 'bid'`, `round: 2`, `currentRound.bidSubPhase: 'bids'`, two alive players, valid `bids`. Assert `getByText('Editar distribuidor')` is in the document.
  - Test 2 "hidden in round 1 bids": state with `phase: 'bid'`, `round: 1`, `currentRound.bidSubPhase: 'bids'`, two alive players, valid `bids`. Assert `queryByText('Editar distribuidor')` returns null.

---

## Phase 5 — Polish & Cross-Cutting

- [x] T00X [P] In `docs/e2e-test-scenarios.md`, add scenario **E2E-019** after E2E-018:

  ```
  ### E2E-019: Marcadores de distribuidor persistem em todas as fases da rodada (Modo 1)

  - **Regras relacionadas**: RN-018, RN-019
  - **Pré-condições**: Partida no Modo 1 com 2 jogadores (Alice pos.0, Bob pos.1), rodada 1.
  - **Passos**:
    1. Selecionar manilha.
    2. Confirmar Alice como distribuidora.
    3. Na fase de palpites: verificar "Distribui" no nome de Alice e "Primeiro palpite" no nome de Bob.
    4. Clicar em "Iniciar Rodada".
    5. Na fase de jogo: verificar "Distribui" no nome de Alice e "Primeiro palpite" no nome de Bob.
    6. Clicar em "Finalizar Rodada".
    7. Na fase de resultado: verificar "Distribui" no nome de Alice e "Primeiro palpite" no nome de Bob.
  - **Resultado esperado**: Os marcadores "Distribui" e "Primeiro palpite" aparecem no nome correto dos jogadores nas três fases sem interrupção.
  ```

---

## Dependency Graph

```
T001 (PlayingPhase fix)
  └─► T002 (PlayingPhase tests) [P with T003]

T003 (ResultPhase fix) [P with T001]
  └─► T004 (ResultPhase tests) [P with T002]

T005 (edit dealer button verification)
  └─► T006 (edit dealer button tests)

T007 (E2E scenario doc) [P — independent]
```

## Parallel Execution Opportunities

| Parallel Group | Tasks | Condition |
|---|---|---|
| Phase fixes | T001, T003 | Both modify different functions in same file — sequential recommended to avoid merge conflicts |
| Tests | T002, T004, T006 | After T001+T003 complete; can all be written in one pass in the same test file |
| Docs | T007 | Any time; no code dependency |

> **Note**: T001 and T003 both modify `src/pages/GameRoundPage.tsx`. Apply both changes in a single edit session to avoid conflicts.

---

## Implementation Strategy

**MVP (minimum to unblock users)**:
- T001 + T003 (the two-line fix in each function) — resolves the visible bug immediately

**Then stabilize**:
- T002 + T004 + T005 + T006 (tests covering all three phases + edit button)

**Then document**:
- T007 (E2E scenario)

---

## Task Count Summary

| Phase | Tasks | Notes |
|---|---|---|
| Phase 2 — US1 Playing Phase | T001–T002 | 1 impl + 1 test |
| Phase 3 — US2 Result Phase | T003–T004 | 1 impl + 1 test (parallelizable with Phase 2) |
| Phase 4 — US3 Edit Button | T005–T006 | 1 verify + 1 test |
| Phase 5 — Polish | T007 | E2E doc update |
| **Total** | **7 tasks** | 5 parallelizable |

---

## Constitution Compliance

| Principle | Status |
|---|---|
| Cobertura de Testes Obrigatória | ✅ T002, T004, T006 cover all functional requirements |
| DRY | ✅ Reuses existing `getDealerId`/`getFirstBidderId`; no new logic |
| README Completo | ✅ No README change needed |
| Regras de Negócio Documentadas | ✅ Existing rules in `docs/business-rules.md` already cover dealer labels; no new rules |
| Cenários de Teste E2E Documentados | ✅ T007 adds E2E-019 covering the full label persistence flow |

# Tasks — Extend Dealer Toggle Visibility to Bids and Playing Phases (SPEC-023)

**Feature**: Extend Dealer Toggle Visibility to Bids and Playing Phases  
**Spec**: `specs/005-extend-dealer-toggle/spec.md`  
**Plan**: `.specify/impl-plan.md` (Sprint 11)  
**Total tasks**: 6  

---

## User Stories

| ID | Story | Spec Ref |
|----|-------|----------|
| US1 | In the bids sub-phase (any round), the dealer change button is visible and functional so players can correct the dealer before starting the round | FR-001, FR-006, Scenarios 1, 2, 7 |
| US2 | During the playing phase, the dealer change button is visible and functional so players can correct the dealer mid-round without interrupting the timer or losing tricks data | FR-002, FR-003, FR-004, FR-005, FR-007, Scenarios 3, 4, 5, 6, 8 |

---

## Phase 1 — User Story 1: Dealer change available in bids sub-phase (all rounds)

> **Story goal**: A player in any round who has entered bids can tap a button to change who deals the cards. After the change, the "Distribui"/"Primeiro palpite" labels update and bids remain intact.

**Independent test criteria**:
- When `phase === 'bid'` and `bidSubPhase === 'bids'` and `round === 1`, the "Editar distribuidor" button is visible
- Clicking "Editar distribuidor" on round 1 transitions the UI to show `DealerSelectionStep`
- After confirming a new dealer during bids sub-phase, `confirmDealer` is called with the selected index and bids are preserved

- [x] T001 [US1] Remove the `{round >= 2 && (` guard in `BidPhase` in `src/pages/GameRoundPage.tsx` so the "Editar distribuidor" button is rendered unconditionally whenever `bidSubPhase === 'bids'` (remove the `round >= 2` condition and its closing brace, keep the button and its `onClick={editDealer}` handler unchanged)

---

## Phase 2 — User Story 2: Dealer change available in playing phase

> **Story goal**: A player in an active round can tap a button to change who deals. The DealerSelectionStep appears inline (replacing the player list temporarily), the timer keeps running, and after confirming, the player list returns with updated labels and the updated dealerIndex is persisted for next-round rotation.

**Independent test criteria**:
- When `phase === 'playing'`, the dealer change button (text matching `/alterar distribuidor/i`) is visible
- Clicking the dealer change button shows the `DealerSelectionStep` (heading "Quem distribui as cartas?" is in document)
- Clicking "Cancelar" hides the `DealerSelectionStep` and restores the player list without calling `confirmDealer`
- After confirming a new dealer, `confirmDealer` is called with the selected index; `isEditingDealer` resets to false

- [x] T002 [US2] Add dealer toggle to `PlayingPhase` in `src/pages/GameRoundPage.tsx`:
  1. Add `const confirmDealer = useGameStore(s => s.confirmDealer);` to the store subscriptions at the top of `PlayingPhase`
  2. Add `const [isEditingDealer, setIsEditingDealer] = useState(false);` after the existing `useState` declarations
  3. Replace the `<div className="space-y-2 mb-2">` section (the `<h2>` + player list) with a conditional block:
     - When `isEditingDealer === true`: render a `<div className="mb-4">` containing `<DealerSelectionStep players={alive} dealerIndex={state.dealerIndex} onConfirm={(idx) => { confirmDealer(idx); setIsEditingDealer(false); }} />` followed by `<button onClick={() => setIsEditingDealer(false)} className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline">Cancelar</button>`
     - When `isEditingDealer === false`: render the existing `<div className="space-y-2 mb-2">` with the `<h2>` and player map, adding a dealer toggle button in the header: `<div className="flex items-center justify-between mb-2"><h2 className="font-semibold text-slate-300 text-sm">Acertos da rodada</h2><button onClick={() => setIsEditingDealer(true)} className="text-xs text-slate-500 hover:text-slate-300 underline">Alterar distribuidor</button></div>` (replace the standalone `<h2>` with this flex container)

---

## Phase 3 — Tests (Mandatory — Cobertura de Testes Obrigatória)

- [x] T003 [US1] Update `src/pages/__tests__/GameRoundPage.test.tsx` — in the `describe('BidPhase — edit dealer button', ...)` block: (a) rename the test `'shows "Editar distribuidor" button in round 2 bids sub-phase'` to `'shows "Editar distribuidor" button in round 2 bids sub-phase'` (keep as-is); (b) change the test `'does not show "Editar distribuidor" button in round 1 bids sub-phase'` to instead assert the button IS present: replace `expect(screen.queryByText('Editar distribuidor')).not.toBeInTheDocument()` with `expect(screen.getByText('Editar distribuidor')).toBeInTheDocument()` and update the test name to `'shows "Editar distribuidor" button in round 1 bids sub-phase'`

- [x] T004 [US2] Add a new `describe('PlayingPhase — dealer toggle', ...)` block to `src/pages/__tests__/GameRoundPage.test.tsx` with these four tests:
  1. `'shows dealer change button in playing phase'`: render with `{ phase: 'playing', currentRound: makeRound() }`, assert `screen.getByText('Alterar distribuidor')` is in document
  2. `'clicking dealer change button shows DealerSelectionStep'`: render playing phase, `fireEvent.click(screen.getByText('Alterar distribuidor'))`, assert `screen.getByText('Quem distribui as cartas?')` is in document
  3. `'clicking Cancelar hides DealerSelectionStep'`: render playing phase, click 'Alterar distribuidor', then `fireEvent.click(screen.getByText('Cancelar'))`, assert `screen.queryByText('Quem distribui as cartas?')` is NOT in document
  4. `'confirming dealer change calls confirmDealer'`: spy on `useGameStore.getState().confirmDealer` with `vi.spyOn`, render playing phase, click 'Alterar distribuidor', click the second player button (Bob), click 'Confirmar', assert spy was called

---

## Phase 4 — Documentation (Mandatory — Constitution Principles 4 & 5)

- [x] T005 [P] Update `docs/business-rules.md`: (a) in **RN-017**, replace the sentence "Na rodada 1, o distribuidor não pode ser alterado (apenas confirmado). A partir da rodada 2, há opção de alterar quem distribui." with "Em todas as rodadas, há opção de alterar quem distribui — tanto na etapa de confirmação do distribuidor quanto durante a fase de palpites e a fase de jogo."; (b) append a new rule **RN-022** at the end of the file: "### RN-022: Alteração do distribuidor durante a fase de palpites e de jogo (Modo 1)\n\n- **Descrição**: O distribuidor pode ser alterado manualmente durante a fase de palpites (sub-fase de palpites, quando o botão 'Iniciar Rodada' está visível) e durante a fase de jogo (rodada em andamento).\n- **Comportamento esperado**: Ao alterar o distribuidor, os marcadores 'Distribui' e 'Primeiro palpite' são atualizados imediatamente. O índice do distribuidor (`dealerIndex`) é persistido, e a rotação automática da rodada seguinte deriva do novo distribuidor.\n- **Exceções**: A fase de jogo não é interrompida — o cronômetro continua e as entradas de vazas são preservadas durante a alteração do distribuidor."

- [x] T006 [P] Add three new E2E scenarios to `docs/e2e-test-scenarios.md`:
  - **E2E-022**: "Alteração do distribuidor na fase de palpites — rodada 1 (Modo 1)" — Rules: RN-022, RN-017; Preconditions: 2-player game, round 1, `bidSubPhase = 'bids'`; Steps: (1) Select manilha and confirm dealer, (2) Verify "Editar distribuidor" button is visible in round 1, (3) Tap "Editar distribuidor", (4) Select the second player as dealer, (5) Click "Confirmar", (6) Verify "Distribui" moved to second player and "Primeiro palpite" to first player; Expected: dealer change reflected in labels, round 1 restriction removed
  - **E2E-023**: "Alteração do distribuidor durante a fase de jogo (Modo 1)" — Rules: RN-022, RN-018; Preconditions: 2-player game, round in progress (`phase = 'playing'`); Steps: (1) Verify "Alterar distribuidor" button is visible, (2) Tap "Alterar distribuidor", (3) Verify DealerSelectionStep appears and timer is still running, (4) Select second player as dealer, (5) Click "Confirmar", (6) Verify player list returns with updated "Distribui" and "Primeiro palpite" labels, (7) Verify tricks inputs are still present and values unchanged; Expected: dealer change applied without interrupting the round
  - **E2E-024**: "Rotação do distribuidor na rodada seguinte após alteração manual (Modo 1)" — Rules: RN-010, RN-022; Preconditions: 2-player game (Alice pos.0, Bob pos.1), round 1 playing phase; Steps: (1) Change dealer to Bob during round 1 playing phase, (2) Finish round 1 via "Finalizar Rodada", (3) In round 2 bid phase, verify that the pre-selected dealer is Alice (next alive player after Bob in circular order); Expected: rotation derives from the manually set dealer, not the original one

---

## Dependency Graph

```
T001 (BidPhase: remove round >= 2 guard)
  └─► T003 (tests: update round 1 button test)

T002 (PlayingPhase: add dealer toggle)
  └─► T004 (tests: playing phase dealer toggle)

T005 (docs: business-rules)   [P with T006]
T006 (docs: e2e-scenarios)    [P with T005]
```

---

## Parallel Execution Examples

**T001 and T002** can be started in parallel (different functions in the same file):
- Agent A: T001 → T003 (BidPhase change + test update)
- Agent B: T002 → T004 (PlayingPhase change + tests)

**T005 and T006** can run in parallel with each other and with T001/T002:
- Agent C: T005 (business rules docs)
- Agent D: T006 (E2E scenarios docs)

---

## Implementation Strategy

**MVP scope** (minimum viable, observable in browser): T001 + T002 — makes the dealer change button visible in both phases.

**Complete delivery**: All 6 tasks including tests and docs (required for PR merge per constitution).

**Suggested execution order for a single agent**: T001 → T002 → T003 → T004 → T005 → T006

# Tasks — Cycles Within a Round in Modo 2 (SPEC-027)

**Feature**: Cycles Within a Round in Modo 2 (Painel Individual)
**Spec**: [spec.md](./spec.md)
**Research**: [research.md](./research.md)
**Generated**: 2026-04-19
**Branch**: `claude/suspicious-bose-176d51`

---

## User Stories

| ID  | Priority | Description |
|-----|----------|-------------|
| US1 | P1 | As a Modo 2 player, I can see a "Cycle N — X / numPlayers" indicator and a "Next Cycle" control on the play screen; the app caps the number of cards (own + other) I can register per cycle at `numPlayers` and allows at most one own card per cycle, so I stay in sync with the physical table |
| US2 | P2 | As a Modo 2 player, I can step back to the previous cycle (when the current cycle has 0 cards) to correct a premature advance, so accidental taps don't force me to restart the round |
| US3 | P3 | As a Modo 2 player, cycle state (current cycle, per-cycle count) persists across reloads and a "round complete" state appears when the last cycle fills, so I can pause/resume mid-round and see clearly when to tap the existing finish-round action |

---

## Implementation Strategy

MVP = **US1** (state model + indicator + cap enforcement + Next-cycle advance). Without advance, the cap would lock the user after cycle 1, so `advanceCycle` is part of MVP. US2 (previous-cycle undo) and US3 (persistence + round-complete visual) layer on top without schema rework — persistence is actually trivial (two integers + two helpers already in the persisted partialize list once we add them in Phase 2).

**Delivery order**: Phase 2 (types + store foundation) → Phase 3 (US1 — indicator, cap, advance) → Phase 4 (US2 — previous-cycle undo) → Phase 5 (US3 — persistence migration + round-complete visual) → Phase 6 (polish)

---

## Phase 1 — Setup

> No project initialization needed. SPEC-027 builds entirely on the existing `playerHandStore` and `PlayerPage.tsx` (PlayScreen subcomponent).

---

## Phase 2 — Foundational: Types & Store Fields

> Blocking prerequisite for all user stories. Introduces the cycle state shape and the store actions that govern it. No UI changes yet.

- [X] T001 Extend `PlayerHandState` in [src/types.ts](src/types.ts) with four new integer/nullable fields added immediately after `otherPlayedCards`: `currentCycle: number` (1-based), `cardsPlayedInCycle: number` (0..numPlayers), `ownCardIndexThisCycle: number | null` (hand-card index that consumed the own-card slot this cycle, or null if none), `otherCardsAddedThisCycle: number` (how many entries at the tail of `otherPlayedCards` were added in the current cycle) — preserve field order; no other type changes

- [X] T002 Extend `initialPlayerHandState` and the `PlayerHandStoreActions` interface in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): add `currentCycle: 1`, `cardsPlayedInCycle: 0`, `ownCardIndexThisCycle: null`, `otherCardsAddedThisCycle: 0` to `initialPlayerHandState`; add `advanceCycle(): void` and `previousCycle(): void` to `PlayerHandStoreActions`; do NOT implement yet — the subsequent tasks wire behavior into existing actions

- [X] T003 Update `initSession(playerName, numPlayers)` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts) to also set `currentCycle: 1`, `cardsPlayedInCycle: 0`, `ownCardIndexThisCycle: null`, `otherCardsAddedThisCycle: 0` in the `set(...)` call; mirror the same reset inside `finishRound()` and `reset()`

- [X] T004 Update `toggleHandCardPlayed(index)` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): compute the target card's next `played` value; if toggling **on** (false → true), no-op when `cardsPlayedInCycle >= numPlayers` OR `ownCardIndexThisCycle !== null && ownCardIndexThisCycle !== index`; on successful toggle-on, increment `cardsPlayedInCycle` and set `ownCardIndexThisCycle = index`; if toggling **off** (true → false) and `ownCardIndexThisCycle === index`, decrement `cardsPlayedInCycle` and set `ownCardIndexThisCycle = null` (Q1/A); if toggling off and `ownCardIndexThisCycle !== index`, just flip the card's `played` field without touching counters (covers toggling a card that was played in a past, closed cycle — past cycles stay closed, Q2/A)

- [X] T005 Update `addOtherPlayedCard(card)` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): no-op when `cardsPlayedInCycle >= numPlayers`; otherwise append the card to `otherPlayedCards` AND increment both `cardsPlayedInCycle` and `otherCardsAddedThisCycle` in the same `set(...)` call

- [X] T006 Update `removeOtherPlayedCard(index)` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): always remove the card from `otherPlayedCards`; only decrement `cardsPlayedInCycle` and `otherCardsAddedThisCycle` when the removed index targets the current-cycle window — i.e., when `index >= otherPlayedCards.length - otherCardsAddedThisCycle` (Decision 4 in research.md); otherwise leave counters unchanged (past-cycle removal)

- [X] T007 Update `clearOtherPlayedCards()` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): reset `otherPlayedCards: []` AND decrement `cardsPlayedInCycle` by `otherCardsAddedThisCycle` AND reset `otherCardsAddedThisCycle: 0` (since only current-cycle cards conceptually clear); if the pre-clear `cardsPlayedInCycle - otherCardsAddedThisCycle` would go negative, clamp to 0

- [X] T008 Implement `advanceCycle()` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): no-op when `cardsPlayedInCycle === 0` (FR-004 — prevents accidental empty cycle); otherwise increment `currentCycle` by 1 and set `cardsPlayedInCycle: 0`, `ownCardIndexThisCycle: null`, `otherCardsAddedThisCycle: 0`

- [X] T009 Implement `previousCycle()` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts): no-op when `cardsPlayedInCycle > 0` OR `currentCycle <= 1` (FR-005); otherwise decrement `currentCycle` by 1; do NOT restore any counter (Q2/A — past cycles remain closed)

- [X] T010 Add `currentCycle`, `cardsPlayedInCycle`, `ownCardIndexThisCycle`, `otherCardsAddedThisCycle` to the `partialize` selector in [src/store/playerHandStore.ts](src/store/playerHandStore.ts) so all cycle state rehydrates on reload (Q4/A)

- [X] T011 Bump the `persist` config `version` from `1` to `2` in [src/store/playerHandStore.ts](src/store/playerHandStore.ts) and add a `migrate` function that seeds defaults when migrating a v1 state: `currentCycle: 1`, `cardsPlayedInCycle: 0`, `ownCardIndexThisCycle: null`, `otherCardsAddedThisCycle: 0` (research Decision 5)

- [X] T012 [P] Add a `describe('playerHandStore — cycles', ...)` block to [src/store/__tests__/playerHandStore.test.ts](src/store/__tests__/playerHandStore.test.ts) covering: `'initSession seeds cycle state to defaults'`; `'toggleHandCardPlayed increments cardsPlayedInCycle and sets ownCardIndexThisCycle'`; `'toggleHandCardPlayed blocks a second own card in the same cycle'`; `'toggling off the current own card decrements counter and frees the slot'` (Q1/A); `'toggling off an own card played in a past cycle does not touch counters'` (Q2/A); `'addOtherPlayedCard is a no-op when cardsPlayedInCycle === numPlayers'` (FR-002); `'addOtherPlayedCard increments both cardsPlayedInCycle and otherCardsAddedThisCycle'`; `'removeOtherPlayedCard decrements only when the removed card is in the current-cycle window'` (Decision 4); `'removeOtherPlayedCard leaves counters alone when removing a past-cycle card'`; `'clearOtherPlayedCards subtracts otherCardsAddedThisCycle from the cycle counter and resets it'`; `'advanceCycle is a no-op when cardsPlayedInCycle === 0'` (FR-004); `'advanceCycle increments currentCycle and resets per-cycle counters'`; `'previousCycle is a no-op when currentCycle === 1'`; `'previousCycle is a no-op when cardsPlayedInCycle > 0'` (FR-005); `'previousCycle decrements currentCycle and does not restore past counters'` (Q2/A); `'finishRound resets cycle state to defaults'`; `'persist migration v1 → v2 seeds cycle defaults'` (Decision 5)

---

## Phase 3 — US1: Cycle Indicator, Caps, and Next-Cycle Advance (P1)

> Story goal (US1): `PlayScreen` renders a visible "CICLO N · X/numPlayers" indicator with a "Próximo Ciclo" button; tapping a 2nd own card in the same cycle is visually blocked; adding other-player cards beyond the cap is visually blocked; tapping "Próximo Ciclo" opens cycle N+1 with counter 0.
>
> Independent test: start a Modo 2 session with 3 players and a 2-card round; confirm manilha; on PlayScreen the indicator reads "CICLO 1 · 0/3"; mark one own card played → "1/3" and other own cards become non-actionable; register 2 other-player cards → "3/3" and the add-controls become disabled; tap "Próximo Ciclo" → indicator reads "CICLO 2 · 0/3" and the other own card is actionable again.

- [X] T013 [US1] In the `PlayScreen` component of [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx), subscribe to the four cycle fields and the two new actions: `const { currentCycle, cardsPlayedInCycle, ownCardIndexThisCycle } = state;` added to the existing destructure from `usePlayerHandStore(s => s)` around line 287, and `const advanceCycle = usePlayerHandStore(s => s.advanceCycle);` near the other action subscriptions

- [X] T014 [US1] Compute three derived booleans inside `PlayScreen` in [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx) just above the existing `limitReached` line (~line 294): `const cycleFull = cardsPlayedInCycle >= numPlayers;` — `const ownCardPlayedThisCycle = ownCardIndexThisCycle !== null;` — `const canAdvanceCycle = cardsPlayedInCycle > 0;` — then change `limitReached` so it participates in add-gating: `const addBlocked = limitReached || cycleFull;` and replace the existing `limitReached` checks inside `handleBlockACardSelect`, `handleBlockAManilhaSuit`, `handleUnknown` with `addBlocked`; keep the CardGrid `disabled={limitReached}` prop as-is but pass `disabled={addBlocked}` so cycle cap is enforced in the UI too

- [X] T015 [US1] In the `PlayScreen` JSX of [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx), insert a cycle indicator row between the existing MANILHA compact bar and the progress bar (~between lines 347 and 349): `<div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-3"><span className="text-slate-400 text-xs font-semibold">CICLO</span><span className="text-white text-xl font-mono font-bold">{currentCycle}</span><span className="ml-2 text-slate-300 text-sm font-mono">{cardsPlayedInCycle}/{numPlayers}</span><button type="button" onClick={advanceCycle} disabled={!canAdvanceCycle} className="ml-auto min-h-[44px] px-4 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none">Próximo Ciclo ›</button></div>` — do not change the existing MANILHA bar or progress bar markup

- [X] T016 [US1] Update the own-hand buttons in `PlayScreen` in [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx) (around lines 407–420 — the `handCards.map` block): add `disabled={!card.played && (cycleFull || (ownCardPlayedThisCycle && ownCardIndexThisCycle !== i))}` to each button so (a) the already-played own card in the current cycle can still be tapped to toggle off (Q1/A), (b) all other unplayed own cards become non-interactive while the own slot is taken, and (c) all own toggles block once the cycle is full; add matching disabled styles `disabled:opacity-30 disabled:pointer-events-none` to the className string

---

## Phase 4 — US2: Previous-Cycle Undo (P2)

> Story goal (US2): A "‹ Ciclo Anterior" button appears beside "Próximo Ciclo"; it is enabled only when `currentCycle > 1 && cardsPlayedInCycle === 0`; tapping decrements `currentCycle`.
>
> Independent test: advance from cycle 1 to cycle 2; with counter at 0/N tap "‹ Ciclo Anterior" → indicator returns to "CICLO 1 · 0/N"; play one card → counter becomes 1/N and the Previous button becomes disabled again.

- [X] T017 [US2] In `PlayScreen` of [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx), subscribe to `previousCycle`: `const previousCycle = usePlayerHandStore(s => s.previousCycle);` near the other action subscriptions; add derived `const canGoPrevious = currentCycle > 1 && cardsPlayedInCycle === 0;` near the other derived booleans

- [X] T018 [US2] In the cycle indicator row added by T015 in [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx), insert a previous-cycle button immediately before the existing "Próximo Ciclo" button, inside the same `ml-auto` flex group: `<button type="button" onClick={previousCycle} disabled={!canGoPrevious} className="min-h-[44px] px-3 bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 disabled:pointer-events-none mr-2">‹</button>` — move the wrapper div so the two buttons share a right-aligned group via `<div className="ml-auto flex items-center gap-2">...</div>`

---

## Phase 5 — US3: Round-Complete Visual + Persistence Validation (P3)

> Story goal (US3): When the round is complete (all own cards played AND cycle is full), the indicator shows a "Rodada completa" badge; cycle state survives a page reload mid-round.
>
> Independent test: play a full 3-player / 2-card round through cycle 1 and cycle 2; after the final own card is marked played AND the cycle fills, a small "Rodada completa" tag appears in the indicator; hit browser refresh mid-round → indicator restores to the exact cycle number and counter it had before refresh; tap the existing "Finalizar rodada" button to end the round (no auto-finalize — Q3/A).

- [X] T019 [US3] In `PlayScreen` of [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx), compute `const roundComplete = cardsPerPlayer > 0 && handCards.filter(c => c.played).length === cardsPerPlayer && cycleFull;` near the other derived booleans

- [X] T020 [US3] In the cycle indicator row in [src/pages/PlayerPage.tsx](src/pages/PlayerPage.tsx), conditionally render a badge `{roundComplete && <span className="px-2 py-0.5 rounded-md bg-emerald-700/30 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">Rodada completa</span>}` placed after the `cardsPlayedInCycle`/`numPlayers` span and before the `ml-auto` button group — does not auto-finalize the round (user still taps the existing finish button — Q3/A)

- [X] T021 [P] [US3] Add an integration assertion inside the existing cycles test block in [src/store/__tests__/playerHandStore.test.ts](src/store/__tests__/playerHandStore.test.ts): `'cycle state round-trips through the persist partialize selector'` — manually call the `partialize` function (imported/invoked via the store config) with a state that has non-default cycle fields and assert all four cycle fields appear in the output object

---

## Phase 6 — Polish & Cross-Cutting Concerns

- [X] T022 [P] Add rule `RN-027` to [docs/business-rules.md](docs/business-rules.md): "Ciclos dentro de uma rodada no Modo 2 (Painel Individual)" — describe the cycle concept (cada ciclo = uma volta na mesa, capacidade = `numPlayers`), a regra de 1 carta própria por ciclo (com permissão de desmarcar e remarcar outra), o fluxo explícito de avanço via "Próximo Ciclo", a possibilidade de undo via "Ciclo Anterior" somente quando o ciclo atual tem 0 cartas, a persistência do estado dos ciclos em reload, e a exibição de "Rodada completa" sem auto-finalização

- [X] T023 [P] Add E2E scenario `E2E-034` to [docs/e2e-test-scenarios.md](docs/e2e-test-scenarios.md): "Ciclos dentro de uma rodada no Modo 2 (Painel Individual)" — preconditions (sessão Modo 2 ativa, 3 jogadores, rodada 2 com 2 cartas por jogador, Etapa 3/4 visível após seleção de manilha); steps (indicador mostra "CICLO 1 · 0/3"; marcar uma carta própria → "1/3"; tentar marcar outra carta própria → botão desabilitado; registrar 2 cartas de outros jogadores → "3/3" e botões de adicionar desabilitados; tocar "Próximo Ciclo" → "CICLO 2 · 0/3"; registrar todas as cartas restantes até preencher "3/3"; verificar badge "Rodada completa"; recarregar a página e confirmar que o estado dos ciclos é restaurado; tocar o botão existente "Finalizar rodada"); expected result (indicador evolui ciclo a ciclo, caps respeitados, estado persiste em reload, nenhuma finalização automática)

- [X] T024 [P] Add E2E Playwright test `'E2E-034: cycles enforce caps and advance explicitly in Modo 2'` to [tests/e2e/mode2-full.spec.ts](tests/e2e/mode2-full.spec.ts): start Modo 2 with 3 players; confirm manilha on Etapa 1; on the play screen assert the "CICLO 1" label and "0/3" counter are visible; click a hand card → counter shows "1/3"; assert the previous-cycle button `‹` is disabled; click the advance button "Próximo Ciclo" → counter resets to "0/3" and the label reads "CICLO 2"; click `‹` → label back to "CICLO 1" — confirming advance/undo round-trip

- [X] T025 [P] Update the README section that references Modo 2 in [README.md](README.md) to mention that Modo 2 now structures each round in ciclos (one card per player per cycle, explicit advance), adding a one-liner link to `docs/business-rules.md#RN-027`

---

## Dependency Graph

```
T001 (types)
  └─► T002 (state + action signatures)
        └─► T003 (init/finish/reset resets)
        └─► T004 (toggleHandCardPlayed)
        └─► T005 (addOtherPlayedCard)
        └─► T006 (removeOtherPlayedCard)
        └─► T007 (clearOtherPlayedCards)
        └─► T008 (advanceCycle)
        └─► T009 (previousCycle)
        └─► T010 (partialize)
        └─► T011 (persist version + migrate)
              └─► T012 [P] (store unit tests)
              └─► T013 [US1] (subscribe in PlayScreen)
                    └─► T014 [US1] (derived booleans + gate adds)
                          └─► T015 [US1] (cycle indicator + Next button)
                          └─► T016 [US1] (own-hand disabled logic)
                                └─► T017 [US2] (subscribe previousCycle)
                                      └─► T018 [US2] (Previous button)
                                └─► T019 [US3] (roundComplete derive)
                                      └─► T020 [US3] (Rodada completa badge)
                                      └─► T021 [P] [US3] (partialize assertion)
                                      └─► T022 [P] (business rule RN-027)
                                      └─► T023 [P] (E2E scenario doc)
                                      └─► T024 [P] (E2E Playwright test)
                                      └─► T025 [P] (README mention)
```

## Parallel Execution

- T004–T011 edit the same file (`playerHandStore.ts`) so they run sequentially to avoid merge conflicts, but their implementations are independent — a single developer can batch them.
- After T011, T012 (store tests) is `[P]` and runs in parallel with T013–T016 (UI changes in a different file).
- After T016, Phase 4 (T017–T018) and Phase 5 (T019–T020) touch different JSX regions in the same file — sequential is safest; if run together, T018 and T020 must coordinate on the `ml-auto` flex group layout added by T015.
- Phase 6 polish (T022, T023, T024, T025) are all `[P]` — different files, can run together.

---

## Summary

| Phase | Tasks | MVP? |
|---|---|---|
| Phase 2 — Foundational (types + store) | T001–T012 | ✅ required |
| Phase 3 — US1 (indicator + cap + Next) | T013–T016 | ✅ MVP |
| Phase 4 — US2 (Previous-cycle undo) | T017–T018 | ⚪ incremental |
| Phase 5 — US3 (Round complete + persist check) | T019–T021 | ⚪ incremental |
| Phase 6 — Polish (docs + E2E + README) | T022–T025 | ⚪ cross-cutting |

**Total tasks**: 25
**MVP scope**: T001–T016 (foundational store + US1) — delivers the core cycle UX
**Format validation**: All tasks follow `- [ ] TN [P?] [USN?] Description with file path` ✅

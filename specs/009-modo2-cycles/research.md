# Research — SPEC-027: Cycles Within a Round in Modo 2 (Painel Individual)

**Generated**: 2026-04-19
**Branch**: `claude/suspicious-bose-176d51`
**Spec**: [spec.md](./spec.md)

---

## Technical Context

| Aspect | Value |
|---|---|
| Language | TypeScript + React 18 |
| State | Zustand with `persist` middleware (`fodinha-hand` store, v1) |
| Styling | Tailwind CSS |
| Testing | Vitest (unit) + Playwright (E2E) |
| Target entry points | `src/store/playerHandStore.ts`, `src/pages/PlayerPage.tsx` (`PlayScreen` subcomponent), `src/types.ts` |
| No external APIs | Pure local state; no backend or contracts |

No `NEEDS CLARIFICATION` markers remain — all ambiguities resolved in `/speckit.clarify` session 2026-04-19.

---

## Decision 1: Shape of the Cycle State

**Decision**: Add two integer fields to `PlayerHandState`:

```ts
interface PlayerHandState {
  // ...existing fields...
  currentCycle: number;        // 1-based, resets to 1 on round start
  cardsPlayedInCycle: number;  // 0..numPlayers, resets to 0 on advance/round start
}
```

**Rationale**:
- Clarification A to Q2 explicitly rejected per-card cycle attribution. A simple counter avoids tagging each `OtherPlayedCard` and matches the non-goal "no turn-order tracking".
- Two integers are trivially persistable and rehydrate cleanly.
- Derived values (`cycleFull`, `ownCardPlayedThisCycle`) are computed in `PlayScreen` rather than stored, keeping the store surface minimal.

**Alternatives considered**:
- Add `cycle?: number` to each `OtherPlayedCard` and `HandCard`. Rejected — contradicts Q2/A and inflates persisted state.
- Derive `cardsPlayedInCycle` from a full cycle history array. Rejected — history not needed per Q2/A.

---

## Decision 2: Tracking "Own Card Played This Cycle"

**Decision**: Do **not** add a separate `ownCardPlayedThisCycle` field. Instead, track it implicitly: each cycle the user marks exactly one own card as "played", the `toggleHandCardPlayed` action checks the cycle counter and blocks additional own-card plays while the cycle is at its cap or an own card has already been played this cycle.

**Rationale**:
- The own-card slot is a subset of the `cardsPlayedInCycle` counter. Since Q1/A says toggle-off decrements and re-enables the slot, we can model it as: *within the current cycle, own-cards toggled to "played" since the last advance count as the own-card slot*.
- Simplest implementation: track `ownCardIndexThisCycle: number | null` alongside the counter. It points to the hand-card index that consumed the own slot in the current cycle (if any). Toggle-on sets it; toggle-off of that specific card clears it.
- This adds one more field, but avoids fragile counting heuristics.

**Chosen shape** (final):

```ts
interface PlayerHandState {
  // ...
  currentCycle: number;
  cardsPlayedInCycle: number;
  ownCardIndexThisCycle: number | null;
}
```

**Alternatives considered**:
- Count own plays by diffing `handCards.filter(c => c.played).length` against a "played before this cycle" snapshot. Rejected — error-prone and invisible in the store.
- Forbid toggle-off of own cards entirely within a cycle. Rejected — contradicts Q1/A.

---

## Decision 3: Store Actions

**Decision**: Add three new actions and adapt existing ones:

```ts
interface PlayerHandStoreActions {
  // new
  advanceCycle(): void;
  previousCycle(): void;

  // existing, behavior changes
  toggleHandCardPlayed(index: number): void;  // enforce 1-own-per-cycle; update cardsPlayedInCycle + ownCardIndexThisCycle
  addOtherPlayedCard(card: OtherPlayedCard): void;  // no-op if cardsPlayedInCycle >= numPlayers; else increment
  removeOtherPlayedCard(index: number): void;  // decrement cardsPlayedInCycle only if the removed card was added in the current cycle (see Decision 4)
  finishRound(): void;  // reset currentCycle=1, cardsPlayedInCycle=0, ownCardIndexThisCycle=null
  initSession(...): void;  // initialize same three fields
  reset(): void;  // reset same three fields
}
```

**Rationale**:
- Keeps all cycle logic inside the store (same pattern as SPEC-026's `updateNumPlayers`).
- `advanceCycle()` increments `currentCycle`, zeroes `cardsPlayedInCycle`, clears `ownCardIndexThisCycle`. Guarded: only runs when `cardsPlayedInCycle > 0` (FR-004 acceptance).
- `previousCycle()` decrements `currentCycle` (floor 1), only allowed when `cardsPlayedInCycle === 0` (FR-005). It does **not** restore the prior cycle's counter (Q2/A — past cycles close on advance). Practically: it just lowers the cycle number so the user can keep adding cards against the *current* counter (which will now be the still-empty cycle they "reopened") — but per Q2/A, those new adds are attributed to the now-current cycle, not a recovered prior one. The user can then advance again normally.

**Alternatives considered**:
- `previousCycle()` restores the prior counter. Rejected — contradicts Q2/A.
- Inline guards in the UI layer only. Rejected — store is the single source of truth; duplication across components breaks DRY (constitution §2).

---

## Decision 4: Cycle Counter Semantics on `removeOtherPlayedCard`

**Decision**: When the user removes an other-player card, the per-cycle counter decrements **only** if the removed card was added *in the current cycle*. Since we don't tag cards with a cycle number (Q2/A), we need a lightweight proxy: track how many items in `otherPlayedCards` belong to the current cycle.

**Implementation**: maintain `otherCardsAddedThisCycle: number` (separate from the total counter). On `addOtherPlayedCard` (when permitted), increment both `cardsPlayedInCycle` and `otherCardsAddedThisCycle`. On `removeOtherPlayedCard(index)`, if `index >= otherPlayedCards.length - otherCardsAddedThisCycle` (i.e., the card is within the window of current-cycle additions), decrement both; otherwise leave the counter alone (the removal affects a past, closed cycle's contribution only visually).

**Rationale**:
- Preserves Q2/A: past cycles are closed; counters don't retroactively shift.
- Uses a pure integer (not per-card tags) — lowest-cost representation.
- Relies on the append-only nature of `otherPlayedCards` (new cards are always pushed to the tail) so the "last N items" window is safe.

**Alternative considered**: always decrement the per-cycle counter on any remove. Rejected — would let users "free up" slots in the current cycle by deleting closed-cycle cards, violating the cap rule.

**Chosen shape** (final):

```ts
interface PlayerHandState {
  // ...
  currentCycle: number;
  cardsPlayedInCycle: number;
  ownCardIndexThisCycle: number | null;
  otherCardsAddedThisCycle: number;
}
```

---

## Decision 5: persist Version Bump

**Decision**: Bump `fodinha-hand` from version 1 to version 2, with a `migrate` that seeds cycle fields.

**Rationale**:
- New fields are added to the persisted shape (per Q4/A: persist `currentCycle` and `cardsPlayedInCycle`; `ownCardIndexThisCycle` and `otherCardsAddedThisCycle` follow for correctness).
- Users with persisted state from v1 need sane defaults: `currentCycle = 1`, `cardsPlayedInCycle = 0`, `ownCardIndexThisCycle = null`, `otherCardsAddedThisCycle = 0`. This effectively restarts cycle tracking on first load after upgrade, which is acceptable — the user simply begins the current round's next action as cycle 1.

**Alternatives considered**:
- Leave version at 1 and rely on undefined → default coercion. Rejected — `persist` with strict hydration plus TypeScript types benefits from an explicit migration; makes the intent auditable.

---

## Decision 6: UI Placement and Pattern

**Decision**: Place the cycle indicator in the `PlayScreen` header area, directly below the existing "MANILHA" compact bar and above the progress bar. Reuse existing design tokens (Tailwind `bg-slate-800`, `rounded-lg`, `min-h-[44px]` targets).

**Layout**:

```
[ ‹ back ][ name / Rodada · jogadores · cartas ]
[ MANILHA V       |  remaining/total ]
[ CICLO {n}  ·  {cardsPlayedInCycle}/{numPlayers}  [‹ Prev] [Next ›] ]
[ progress bar ]
[ Block A: other cards ]
[ Block B: my hand ]
```

**Rationale**:
- Cycle state is context for the round, so it belongs near the other round-level info (manilha, remaining count).
- Keeps Block A (other cards) and Block B (my hand) controls unchanged — only their `disabled` conditions become cycle-aware.
- Reusing the ConfigScreen/SPEC-026 button style keeps the UI cohesive (DRY, constitution §2).

**Alternatives considered**:
- Floating action bar at the bottom for Next/Prev. Rejected — the screen already has a fixed-pb-24 bottom zone and another floating bar would crowd the layout.
- Separate modal for cycle management. Rejected — adds friction for the core "advance" action that users will do several times per round.

---

## Decision 7: Button States

| State | Next Cycle button | Previous Cycle button | Other-card add | Own-card toggle |
|---|---|---|---|---|
| `cardsPlayedInCycle === 0` | disabled | enabled (if `currentCycle > 1`) | enabled | enabled |
| `0 < cardsPlayedInCycle < numPlayers`, own not played | enabled | disabled | enabled | enabled |
| `0 < cardsPlayedInCycle < numPlayers`, own already played | enabled | disabled | enabled | disabled for other own cards; the one "played" own card can still toggle off (Q1/A) |
| `cardsPlayedInCycle === numPlayers` | enabled | disabled | disabled | disabled (unless toggling off the current own card) |
| Final cycle complete & all own cards played | enabled (no-op; or hidden) | disabled | disabled | disabled | `round complete` message shown; existing finish-round action required (Q3/A) |

**Rationale**: Encodes all clarifications (Q1–Q4) in a single state matrix that maps directly to UI props.

---

## Decision 8: Tests

**Decision**: Three layers, matching the constitution §1 (Cobertura de Testes Obrigatória):

1. **Unit tests** (`src/store/__tests__/playerHandStore.test.ts`): new cases for `advanceCycle`, `previousCycle`, cycle cap on `addOtherPlayedCard`, own-card toggle cap, toggle-off decrement (Q1/A), retroactive-remove semantics (Decision 4), persist migration v1→v2.
2. **Component tests** (`src/pages/__tests__/PlayerPage.test.tsx`, if present, otherwise extend existing Modo 2 coverage): cycle indicator renders, buttons enable/disable per Decision 7, round-complete state visible.
3. **E2E scenario**: new entry in `docs/e2e-test-scenarios.md` walking a 3-player, 2-card round through two cycles, including an undo-to-previous-cycle correction.

---

## Constitution Check

| Principle | Status |
|---|---|
| Cobertura de Testes Obrigatória | ✅ — Store actions + cycle logic covered by unit tests; new E2E scenario documented |
| DRY | ✅ — Cycle logic centralized in store; UI reuses existing Tailwind tokens and button patterns |
| README Completo | ⚠️ — README may need a one-line mention that Modo 2 now has cycles; to be evaluated at task time |
| Regras de Negócio Documentadas | ✅ — New business rules added to `docs/business-rules.md` (cycle cap, 1-own-per-cycle, advance/undo semantics) |
| Cenários E2E Documentados | ✅ — New cycles scenario added to `docs/e2e-test-scenarios.md` |

No unjustified gate violations.

---

## Out of Scope for This Plan

- Modo 1 impacts (none).
- Animated transitions between cycles (optional polish, not required).
- Per-cycle history persistence beyond current cycle.
- Changes to the existing finish-round flow or `GameRoundPage` (Modo 1).

# Cycles Within a Round in Modo 2 (Painel Individual)

**Feature ID**: SPEC-027
**Status**: Draft
**Created**: 2026-04-19
**Author**: Marcos Souza

---

## Clarifications

### Session 2026-04-19

- Q: If the user toggles an own card back to "not played" inside the current cycle (misclick correction), how should the counter and the 1-own-card-per-cycle rule behave? → A: Toggle-off decrements the cycle counter and re-enables another own-card play in the same cycle (still capped at 1 own card played at a time per cycle).
- Q: Should other-player cards be attributed to the specific cycle they were added in, allowing retroactive edits to past cycles? → A: No — cards are attributed implicitly to the cycle they were added in, past cycles close on advance, and retroactive edits are only possible via the previous-cycle undo (FR-005) while the current cycle has 0 cards.
- Q: When the last cycle of the last own card fills, should the round auto-finalize? → A: No auto-finalize — the cycle indicator shows a "round complete" state and the user still triggers the existing finish-round action explicitly.
- Q: Should cycle state (`currentCycle`, `cardsPlayedInCycle`) be persisted across reload like the rest of the round state? → A: Yes — persist both fields in the store's `partialize` list so a mid-round reload restores the exact cycle and per-cycle count.

---

## Overview

In Modo 2 (Painel Individual), each round is played card-by-card across the table: every player plays one card, and only when that batch is complete does the next card go down. This feature introduces a visual **cycle** concept inside each round so the user can clearly see how many cards have been played in the current batch and cannot log more than one card per player per cycle — neither for themselves nor for the other players being tracked.

The number of players at the table is the maximum number of cards that can be registered in a single cycle (including the app user's own card). Once that maximum is reached, the user explicitly advances to a new cycle before the next card can be played.

---

## Problem Statement

Today in Modo 2 the user plays their own cards and logs cards from the other players without any structural grouping per "turn around the table". This makes it easy to:

- Play a second card from the user's own hand before the rest of the table has played their first card of the current turn.
- Register more cards from other players in one turn than there are actual players.
- Lose track of how many cards are still expected on the table for the current turn.

There is no visual feedback that matches the physical flow of the game (one card per player per turn), and no safeguard that prevents an obviously invalid state where, for example, 5 "other player" cards show up in a 4-player game within a single turn.

---

## Goals

- Make the "one card per player per turn" structure visible inside each round in Modo 2.
- Cap the number of cards (own + other players) that can be registered per cycle at the current `numPlayers` value.
- Require an explicit user action to close the current cycle and open the next one.
- Apply the same rule to the app user's own hand: the user cannot mark a second own card as played within the same cycle.
- Keep the UX touch-friendly and aligned with the existing Modo 2 play screen.

---

## Non-Goals

- Tracking which specific other player played which card or in what order within a cycle.
- Enforcing turn order among the other players.
- Adding player names or avatars to Modo 2.
- Applying cycles to Modo 1 (Painel do Mestre).
- Automatic detection of cycle end (no timers, no "smart" auto-advance based on count).

---

## User Scenarios & Testing

### Scenario 1 — Cycle indicator visible during play

**Given** the user is on the play screen (Etapa 3/4) of a Modo 2 round with `numPlayers = 4`
**When** the round begins
**Then** a cycle indicator is visible showing "Cycle 1" (or equivalent) and "0 / 4 cards played"
**And** an "advance to next cycle" control is visible but disabled (or clearly inactive) until at least one card has been played in the cycle

### Scenario 2 — User plays own card first in a cycle

**Given** cycle 1 is active with `numPlayers = 4` and 0 cards played
**When** the user marks one of their own hand cards as played
**Then** the cycle count becomes "1 / 4"
**And** the user cannot mark another of their own hand cards as played in the same cycle

### Scenario 3 — Registering other players' cards fills the cycle

**Given** the user has played their own card in cycle 1 (count 1 / 4, `numPlayers = 4`)
**When** the user registers 3 other-player cards one by one
**Then** the cycle count advances to 2 / 4, 3 / 4, 4 / 4
**And** the "add other card" control is disabled once the count reaches 4 / 4

### Scenario 4 — Cycle cap prevents excess cards

**Given** the cycle counter is at 4 / 4 with `numPlayers = 4`
**When** the user attempts to mark another own card as played or add another other-player card
**Then** the action is blocked (button disabled or tap is a no-op)
**And** the user is guided to advance to the next cycle before continuing

### Scenario 5 — User advances to next cycle

**Given** at least one card has been played in the current cycle
**When** the user taps "Next Cycle" (or equivalent control)
**Then** the cycle number increments (e.g., "Cycle 2")
**And** the played-card counter resets to 0 / N
**And** the cards already played in previous cycles remain recorded and visible (own hand cards stay marked played; previously registered other-player cards remain in history or are cleared according to the existing play-screen behaviour)

### Scenario 6 — Own card can only be played once per cycle

**Given** cycle 2 is active and the user has already marked one own card as played in cycle 2
**When** the user tries to mark a second own card as played in the same cycle
**Then** the action is blocked until the user advances to cycle 3

### Scenario 7 — Cycle cap follows current `numPlayers`

**Given** the user adjusted `numPlayers` from 4 to 3 on Etapa 1 (per SPEC-026)
**When** the round's play screen loads
**Then** the cycle cap used throughout that round is 3
**And** the counter reads "0 / 3" at the start of cycle 1

### Scenario 8 — Round ends when hand is empty

**Given** the user has played all their own hand cards across successive cycles
**When** the final cycle completes
**Then** the cycle indicator shows a "round complete" state (e.g., "Cycle N — N / N — round complete")
**And** the round is not auto-finalized — the user still triggers the existing finish-round action explicitly
**And** no additional cycles are required beyond the number of cards per player

### Scenario 9 — Going back a cycle to correct a miscount

**Given** the user has advanced from cycle 1 to cycle 2 by mistake before all 4 cards were registered
**When** the user taps a "previous cycle" / undo control
**Then** the cycle indicator returns to cycle 1 with its prior count
**And** the user can register the missing card(s) before advancing again

---

## Functional Requirements

### FR-001 — Cycle indicator on the play screen

A visual cycle indicator must be present on the Modo 2 play screen for every round, showing the current cycle number and the count `played / numPlayers`.

**Acceptance criteria**:
- Indicator is visible on Etapa 3/4 (play screen) from the moment the round starts.
- Current cycle number starts at 1 and increments by 1 each time the user advances.
- Counter shows `cardsPlayedInCycle / numPlayers`.

### FR-002 — Cycle cap on cards played per cycle

The sum of (own cards marked played this cycle) + (other-player cards registered this cycle) must not exceed the current `numPlayers` value.

**Acceptance criteria**:
- Once the count reaches `numPlayers`, controls that would add another card (own hand card toggle to played, "add other card") are disabled or become no-ops.
- The own-hand-card cap also enforces at most 1 own card per cycle (since the user represents exactly one seat at the table).

### FR-003 — One own card per cycle

Within a single cycle, the user may mark at most one of their own hand cards as played.

**Acceptance criteria**:
- After one own card is marked played in the current cycle, other own hand cards are visually indicated as unavailable for play until the next cycle.
- Attempting to toggle a second own card in the same cycle is blocked.
- If the user un-marks the own card played in the current cycle, the per-cycle counter decrements by 1 and the user may then mark a different own card as played in the same cycle (still only one own card can be in the "played" state at any time within the cycle).

### FR-004 — Advance-to-next-cycle control

An explicit control must allow the user to close the current cycle and open the next one.

**Acceptance criteria**:
- The control is visible during play.
- Advancing resets the per-cycle played count to 0 and increments the cycle number.
- Advancing is only enabled after at least one card has been played in the current cycle (preventing accidental empty cycles).

### FR-005 — Undo / previous-cycle control

The user can step back to the previous cycle to correct a premature advance.

**Acceptance criteria**:
- A "previous cycle" action restores the prior cycle's number and its last known per-cycle played count.
- Stepping back is only available when the current cycle has recorded 0 cards (i.e., the user just advanced and has not yet logged anything new).

### FR-006 — Cycle state resets each round and persists across reload

Cycle state (current cycle number, per-cycle count) must reset when a new round begins.

**Acceptance criteria**:
- On round start (after manilha confirmation in Etapa 1 flow), the cycle indicator reads "Cycle 1 — 0 / numPlayers".
- Previous round's cycle history is not carried over.
- `currentCycle` and `cardsPlayedInCycle` are persisted in the store (same mechanism as other round fields), so a mid-round reload restores the exact cycle number and per-cycle counter.

### FR-007 — Cap follows live `numPlayers`

The per-cycle cap is always the current `numPlayers` value for the round, including any adjustment made via the SPEC-026 player count control on Etapa 1.

**Acceptance criteria**:
- If `numPlayers` is 3 when the play screen loads, the cap is 3 for every cycle in that round.
- Mid-round changes to `numPlayers` are out of scope for this feature.

### FR-008 — Visual clarity of cycle boundaries

The UI must make it easy to tell when a cycle is in progress, when it is full, and when the user has advanced.

**Acceptance criteria**:
- Counter style changes (e.g., emphasis, color) when the cycle reaches its cap.
- The advance control is visually distinct and within comfortable thumb reach on a mobile viewport.
- Tap targets are at least 44×44 CSS pixels.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Cycle indicator visible on every Modo 2 play screen | 100% of rounds |
| Cards-per-cycle cap respected (own + other combined) | 100% — no round can exceed `numPlayers` cards in a single cycle |
| Own-card-per-cycle cap respected | 100% — never more than 1 own card per cycle |
| Cycle advance requires explicit user action | 100% — no automatic advance |
| Cycle state resets on new round | 100% of round transitions |
| Tap targets meet minimum size standard | All cycle controls ≥ 44×44 CSS px |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Cycle | A unit inside a round during which each player at the table plays exactly one card; capped at `numPlayers` cards total |
| Cycle Indicator | New UI element on the Modo 2 play screen showing current cycle number and per-cycle count `played / numPlayers` |
| Cycle Counter (`cardsPlayedInCycle`) | Integer tracking how many cards (own + other) have been recorded in the current cycle; resets to 0 on advance |
| Current Cycle Number | Integer starting at 1 per round, incremented when the user advances to the next cycle |
| Advance Control | Button that closes the current cycle and opens the next one |
| Previous-Cycle Control | Button that steps back one cycle when the current cycle has no cards yet |

---

## Assumptions

1. The cap equals `numPlayers` (including the app user's own seat). A round with 4 players means up to 4 cards per cycle — 1 own card + 3 other-player cards.
2. The maximum number of cycles per round equals `cardsPerPlayer` (each own hand card is played across successive cycles). No separate limit is enforced on the cycle number — it is implicitly bounded by the hand size.
3. Per-cycle tracking does **not** require identifying which specific other player played which card; only the count matters.
4. When the user advances a cycle, own cards previously marked as played stay marked; only the per-cycle counter resets.
5. Mid-round changes to `numPlayers` are not supported; the cycle cap is captured from the current `numPlayers` and does not auto-shrink if the user somehow changes it mid-round.
6. Existing "clear other played cards" / removal controls continue to work; removing a card from the current cycle decrements the per-cycle count accordingly.
7. Other-player cards are attributed implicitly to the cycle they were added in. Once the user advances, that cycle is considered closed and its counter is not re-opened by later add/remove actions — those actions only affect the current cycle's counter. The only way to edit a prior cycle is via the previous-cycle undo (FR-005), which requires the current cycle to have 0 cards.

---

## Dependencies

- `playerHandStore.ts`: add cycle state — e.g., `currentCycle: number`, `cardsPlayedInCycle: number` — plus actions `advanceCycle()`, `previousCycle()`, and hooks that increment/decrement the per-cycle count when own-card and other-card actions run.
- `PlayerPage.tsx` (Etapa 3/4 play screen): render the cycle indicator, wire advance/undo controls, and gate the existing play/add actions on the cycle cap.
- SPEC-026 (player count stepper on Etapa 1): provides the live `numPlayers` value the cycle cap uses.

---

## Out of Scope

- Modo 1 changes.
- Tracking turn order among other players.
- Automatic cycle advance based on counters or timers.
- Animations for cycle transitions (basic state change only; polish is optional and not required for acceptance).
- Persisting per-cycle history beyond the current cycle (only aggregate round outcome is persisted as today).
- Changing the existing round-end / finalize-round flow.

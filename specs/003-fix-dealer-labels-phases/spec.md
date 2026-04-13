# Fix: Dealer Labels Persist Through All Game Phases

**Feature ID**: SPEC-021
**Status**: Draft
**Created**: 2026-04-13
**Author**: Marcos Souza

---

## Overview

After starting a round (clicking "Iniciar Rodada"), the "Distribui" and "Primeiro palpite" labels on player names disappear. They must remain visible throughout the playing phase and result phase of every round. The "Editar distribuidor" button must also remain accessible during the bids phase.

---

## Problem Statement

In SPEC-020, the dealer labels ("Distribui" and "Primeiro palpite") were implemented on `PlayerCard` and correctly wired into the bids sub-phase. However, the playing phase and result phase render `PlayerCard` without these props — so after clicking "Iniciar Rodada" the labels disappear.

The root cause: the SPEC-020 commit removed the old per-phase `isDealer` calculation from `PlayingPhase` without replacing it with the new `getDealerId`/`getFirstBidderId` helpers. `ResultPhase` has the same omission.

This is an incomplete implementation, not a cache or deployment issue. The production site at GitHub Pages reflects the same code.

---

## Goals

- Show "Distribui" label on the dealer's player card during the playing phase.
- Show "Primeiro palpite" label on the first-bidder's player card during the playing phase.
- Show both labels during the result phase.
- Confirm the "Editar distribuidor" button is visible in the bids sub-phase for round 2+.

---

## Non-Goals

- Changes to how dealer selection or rotation works (SPEC-020 already handles this).
- Any change to Modo 2.
- Any change to scoring, lives, or trick calculation.

---

## User Scenarios & Testing

### Scenario 1 — Labels visible in playing phase

**Given** the bid phase is complete and the dealer and first-bidder are set  
**When** the user clicks "Iniciar Rodada"  
**Then** the playing phase shows the "Distribui" label on the dealer's player card  
**And** the "Primeiro palpite" label is shown on the first-bidder's player card  
**And** both labels remain visible for the entire duration of the playing phase

### Scenario 2 — Labels visible in result phase

**Given** the playing phase has ended (user clicked "Finalizar Rodada")  
**When** the result phase loads  
**Then** the "Distribui" label is visible on the dealer's player card  
**And** the "Primeiro palpite" label is visible on the first-bidder's player card

### Scenario 3 — Labels consistent across all three phases

**Given** a round is in progress with player A as dealer and player B as first bidder  
**When** the user navigates through bid → playing → result phases  
**Then** player A consistently shows "Distribui" in all three phases  
**And** player B consistently shows "Primeiro palpite" in all three phases

### Scenario 4 — Edit dealer button visible in bids phase

**Given** the game is in the bids sub-phase of round 2 or later  
**When** the bids screen is shown  
**Then** an "Editar distribuidor" button is visible  
**And** tapping it returns to the dealer selection step

### Scenario 5 — No edit button in round 1 bids phase

**Given** the game is in the bids sub-phase of round 1  
**When** the bids screen is shown  
**Then** no "Editar distribuidor" button is visible

---

## Functional Requirements

### FR-001 — Dealer label visible during playing phase

The player designated as dealer must show the "Distribui" label on their player card during the playing phase.

**Acceptance criteria**:
- The "Distribui" label appears on the dealer's row after "Iniciar Rodada" is clicked.
- The label is derived from the same dealer state used in the bids phase (no divergence).
- The label is absent from all other players' rows.

### FR-002 — First-bidder label visible during playing phase

The player designated as first bidder must show the "Primeiro palpite" label on their player card during the playing phase.

**Acceptance criteria**:
- The "Primeiro palpite" label appears on the first-bidder's row after "Iniciar Rodada" is clicked.
- The label is derived from the same first-bidder state used in the bids phase.
- The label is absent from all other players' rows.

### FR-003 — Dealer label visible during result phase

The dealer must show the "Distribui" label on their player card during the result phase.

**Acceptance criteria**:
- The "Distribui" label appears on the dealer's row when the result phase loads.
- The label matches the dealer from the same round's bids and playing phases.

### FR-004 — First-bidder label visible during result phase

The first bidder must show the "Primeiro palpite" label during the result phase.

**Acceptance criteria**:
- The "Primeiro palpite" label appears on the first-bidder's row in the result phase.
- The label matches the first-bidder from the same round.

### FR-005 — Edit dealer button present in bids phase from round 2

An "Editar distribuidor" button is visible in the bids sub-phase for round 2 and later, allowing the user to return to the dealer selection step.

**Acceptance criteria**:
- The button is visible when `bidSubPhase === 'bids'` and `round >= 2`.
- The button is not visible when `round === 1`.
- Tapping the button transitions `bidSubPhase` back to `'dealer'`.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| "Distribui" label shown in playing phase | 100% of rounds, on correct player |
| "Primeiro palpite" label shown in playing phase | 100% of rounds, on correct player |
| "Distribui" label shown in result phase | 100% of rounds, on correct player |
| "Primeiro palpite" label shown in result phase | 100% of rounds, on correct player |
| Labels consistent across all three phases | Same player identified in all three phases |
| Edit dealer button visible in bids phase, round 2+ | Present in 100% of round 2+ bids screens |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Dealer (Distribuidor) | Player identified by `getDealerId(state)`; shown with "Distribui" label |
| First Bidder (Primeiro Palpite) | Player identified by `getFirstBidderId(state)`; shown with "Primeiro palpite" label |
| Playing Phase | The phase active after "Iniciar Rodada" is clicked |
| Result Phase | The phase active after "Finalizar Rodada" is clicked |

---

## Root Cause Analysis

In `src/pages/GameRoundPage.tsx`:

- **PlayingPhase** (`PlayingPhase` function, `alive.map` block): renders `<PlayerCard>` without `isDealer` or `isFirstBidder` props. The SPEC-020 commit deleted the old dealer calculation here but did not replace it.
- **ResultPhase** (`ResultPhase` function, `alive.map` block): same omission.

The fix requires calling `getDealerId(state)` and `getFirstBidderId(state)` in both components (as already done in `BidPhase`) and passing the results as `isDealer` / `isFirstBidder` props to `PlayerCard`.

---

## Assumptions

1. `getDealerId` and `getFirstBidderId` in `src/utils/gameUtils.ts` are already correct and tested (implemented in SPEC-020).
2. `PlayerCard` already renders the labels correctly when the props are provided (implemented in SPEC-020).
3. The `"Editar distribuidor"` button in `BidPhase` is already implemented and only needs verification, not a new implementation.
4. No store changes are required — only UI rendering changes in `PlayingPhase` and `ResultPhase`.

---

## Dependencies

- `getDealerId` and `getFirstBidderId` helpers in `src/utils/gameUtils.ts` (already implemented in SPEC-020).
- `isDealer` and `isFirstBidder` props on `PlayerCard` (already implemented in SPEC-020).

---

## Out of Scope

- Changing dealer rotation logic.
- Adding a dealer indicator to the round history table.
- Any Modo 2 changes.

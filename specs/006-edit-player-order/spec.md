# Edit Player Order

**Feature ID**: SPEC-024
**Status**: Draft
**Created**: 2026-04-14
**Author**: Marcos Souza

---

## Overview

Add an "Editar ordem dos jogadores" (Edit Player Order) button visible alongside the existing "Toque para alterar" (Edit Dealer) button during the bids entry and playing phases. Tapping this button opens a modal that allows users to drag-and-drop or reorder alive players, then confirm to persist the new table order. Because "Primeiro palpite" (first bidder) is always the alive player immediately after the dealer in table order, changing the player order directly changes who bids first without touching the dealer assignment.

---

## Problem Statement

The current player order is fixed at the moment players register before the game starts. If players sit in a different physical arrangement at the table, or if users want to adjust the bidding rotation mid-game, there is no way to change the seating order without ending the game and starting over.

The "Primeiro palpite" rule derives directly from who sits after the dealer in the player list. Being unable to adjust this order during a game forces users to restart just to correct a seating mistake, causing unnecessary friction.

---

## Goals

- Show an "Editar ordem dos jogadores" button during the same phases as the "Toque para alterar" button (`bidSubPhase = 'bids'` and `playing` phase).
- Opening the button shows a modal listing all alive players in their current order, with controls to move each player up or down.
- Confirming saves the new player order and immediately recalculates the "Primeiro palpite" label based on the dealer's position in the updated order.
- Automatic rotation for subsequent rounds continues to respect the updated player order.
- All existing game state (bids entered, tricks, timer, lives) is preserved when the order is changed.

---

## Non-Goals

- Changes to Modo 2 (Painel Individual).
- Reordering players during the `manilha`, `dealer`, `result`, `tiebreak`, `finished`, or `setup` phases.
- Changing the dealer assignment (handled by the existing "Toque para alterar" flow).
- Reordering dead (eliminated) players — only alive players are shown and can be reordered.
- Adding undo/history for player order changes.
- Persisting the new order beyond the current game (rematch starts fresh).

---

## User Scenarios & Testing

### Scenario 1 — Button visible during bids entry

**Given** the bid phase is in the `bids` sub-phase with palpite inputs shown  
**When** the user views the screen  
**Then** the "Editar ordem dos jogadores" button is visible alongside the "Toque para alterar" button  
**And** both buttons are visible at the same time

### Scenario 2 — Button visible during playing phase

**Given** the playing phase is active (timer running, tricks inputs shown)  
**When** the user views the screen  
**Then** the "Editar ordem dos jogadores" button is visible alongside the "Toque para alterar" button

### Scenario 3 — User opens the reorder modal

**Given** the "Editar ordem dos jogadores" button is visible  
**When** the user taps the button  
**Then** a modal opens showing all alive players in their current order  
**And** each player row has controls to move the player up or down in the list  
**And** there is a confirm button and a cancel button

### Scenario 4 — User reorders players and confirms

**Given** the reorder modal is open with players in order [A, B, C, D]  
**When** the user moves player D to the first position (order becomes [D, A, B, C])  
**And** taps Confirm  
**Then** the modal closes  
**And** the player list on the main screen reflects the new order  
**And** the "Primeiro palpite" label moves to the player immediately after the dealer in the new order  
**And** the "Distribui" label remains on the same dealer player

### Scenario 5 — First bidder recalculates after order change

**Given** the dealer is player A and order is [A, B, C, D]  
**And** "Primeiro palpite" is player B  
**When** the user reorders to [D, A, C, B] and confirms  
**Then** "Primeiro palpite" is now player C (next alive player after A in the new order)

### Scenario 6 — Bids entry state preserved after order change

**Given** the user has entered palpite values for some players in the bids sub-phase  
**When** the user reorders players and confirms  
**Then** all previously entered palpite values are preserved and still associated with the correct player  
**And** "Iniciar Rodada" remains enabled if it was enabled before the change

### Scenario 7 — Playing phase uninterrupted after order change

**Given** the playing phase is active with the timer running  
**When** the user reorders players and confirms  
**Then** the timer continues running without interruption  
**And** tricks input values are preserved  
**And** "Finalizar Rodada" remains available

### Scenario 8 — User cancels the reorder modal

**Given** the reorder modal is open with modified order  
**When** the user taps Cancel  
**Then** the modal closes  
**And** the original player order is unchanged  
**And** "Primeiro palpite" remains on the original player

### Scenario 9 — Order change persists into the next round

**Given** the user changed player order during round N  
**When** round N ends and round N+1 begins  
**Then** the player list in round N+1 reflects the order set in round N  
**And** dealer rotation advances to the next alive player in the updated order

### Scenario 10 — Dead players are excluded from the reorder modal

**Given** one or more players have been eliminated (lives = 0)  
**When** the reorder modal opens  
**Then** only alive players are shown and can be reordered  
**And** dead players retain their relative position among themselves (no changes to dead player state)

### Scenario 11 — Single alive player (edge case)

**Given** only one alive player remains  
**When** the user opens the reorder modal  
**Then** the modal shows one player with no move controls (already in only possible position)  
**Or** the "Editar ordem dos jogadores" button is not shown when fewer than 2 players are alive

---

## Functional Requirements

### FR-001 — "Editar ordem dos jogadores" button visible during bids sub-phase

The button must appear when `bidSubPhase = 'bids'`, in the same area as the "Toque para alterar" button.

**Acceptance criteria**:
- The button is visible when `bidSubPhase = 'bids'`.
- Tapping the button opens the player reorder modal.
- The button is not shown when `bidSubPhase = 'manilha'` or `bidSubPhase = 'dealer'`.

### FR-002 — "Editar ordem dos jogadores" button visible during playing phase

The button must appear during the `playing` game phase.

**Acceptance criteria**:
- The button is visible when `phase = 'playing'`.
- Tapping the button opens the player reorder modal.

### FR-003 — Player reorder modal content

The modal must list all alive players in their current table order.

**Acceptance criteria**:
- Each row shows the player's name.
- Each row (except the first) has an "up" control to move it one position earlier.
- Each row (except the last) has a "down" control to move it one position later.
- The modal has a Confirm button and a Cancel button.
- Dead players are not listed in the modal.

### FR-004 — Confirming new order updates player positions

When the user confirms the new order, the underlying player position data must be updated to reflect the chosen order.

**Acceptance criteria**:
- After confirmation, `alivePlayers()` returns players in the newly specified order.
- The `position` values (or equivalent ordering mechanism) are updated so the new order is canonical for the remainder of the game.
- The update is persisted (survives app background/foreground cycle via localStorage).

### FR-005 — "Primeiro palpite" recalculates immediately after order change

After confirming a new player order, the "Primeiro palpite" label must reflect the new order without requiring additional user action.

**Acceptance criteria**:
- "Primeiro palpite" is recalculated as the first alive player after the current dealer in the new order (circular).
- The label updates visually without a page refresh.
- `currentRound.firstBidderIndex` is updated to match the new calculation.

### FR-006 — Dealer identity preserved after order change

Changing the player order must not change which player is the dealer.

**Acceptance criteria**:
- After reordering, the "Distribui" label remains on the same player who was dealing before the change.
- `GameState.dealerIndex` is updated to remain pointing to the same player in the new order (index value may change; identity must not).

### FR-007 — Bids and tricks data preserved after order change

All player-keyed game data (bids, tricks) must remain associated with the correct players after a reorder.

**Acceptance criteria**:
- `currentRound.bids` entries are unchanged and still keyed by player ID.
- `currentRound.tricks` entries are unchanged and still keyed by player ID.
- No bid or tricks value is lost or reassigned to a different player.

### FR-008 — Playing phase timer not interrupted by order change

**Acceptance criteria**:
- The timer continues running while the reorder modal is open.
- The timer is not reset after the order change is confirmed or cancelled.

### FR-009 — Order change persists into subsequent rounds

**Acceptance criteria**:
- At the start of the next round, `alivePlayers()` continues to use the updated order.
- Dealer rotation advances to the next alive player in the updated order.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| "Editar ordem dos jogadores" visible during bids entry | 100% of rounds in `bidSubPhase = 'bids'` |
| "Editar ordem dos jogadores" visible during playing phase | 100% of rounds in `playing` phase |
| "Primeiro palpite" updated correctly after order change | 100% of confirmations — immediate, no refresh needed |
| Dealer identity unchanged after order change | 100% — "Distribui" stays on same player |
| Bids and tricks data preserved after order change | 100% — no data loss or reassignment |
| Timer uninterrupted after order change during playing phase | 100% — timer continues running |
| Updated order applied in next round rotation | 100% of subsequent rounds |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Editar ordem dos jogadores | New button visible alongside "Toque para alterar" during `bidSubPhase = 'bids'` and `playing` phase |
| Player Order | The sequence of alive players at the table, determined by their `position` values; governs who bids after whom |
| Reorder Modal | New modal listing alive players in current order with up/down move controls, Confirm, and Cancel |
| First Bidder (Primeiro Palpite) | Alive player immediately after the dealer in the current player order; recalculated when order changes |
| Dealer (Distribuidor) | Player designated as dealer; identity (by player ID) must not change when order is updated |
| Player Position | Sortable attribute on each `Player` that establishes table seating order; updated when user confirms a new order |

---

## Assumptions

1. "Move up" and "move down" controls in the modal are sufficient for reordering; drag-and-drop is an implementation choice, not a requirement.
2. Canceling the modal leaves the original order completely unchanged.
3. The timer is not paused when the reorder modal is open; timer management is unchanged.
4. When calculating "Primeiro palpite" after a reorder, `firstBidderIndex` is recalculated using the same existing formula: next alive player after `dealerIndex` in the updated `alivePlayers()` list.
5. Dead players retain their existing `position` values and remain in their relative positions among the dead; only alive player positions change.
6. The reorder is applied immediately on confirm — there is no intermediate "preview" state before saving.

---

## Dependencies

- SPEC-023 (specs/005-extend-dealer-toggle): "Toque para alterar" button must be visible during `bidSubPhase = 'bids'` and `playing` phase so the new button appears alongside it.
- SPEC-020: "Distribui" and "Primeiro palpite" label infrastructure must be in place.
- `GameState.dealerIndex` and `Player.position` must be writable from both the bids and playing phase contexts.

---

## Out of Scope

- Changing the player order during `manilha`, `dealer`, `result`, `tiebreak`, `finished`, or `setup` phases.
- Any changes to Modo 2.
- Reordering dead players.
- Drag-and-drop reordering (up/down controls are sufficient).
- Persisting the custom order across separate games (rematch resets state).
- Undo/history for order changes.

# Extend Dealer Toggle Visibility to Bids and Playing Phases

**Feature ID**: SPEC-023
**Status**: Draft
**Created**: 2026-04-13
**Author**: Marcos Souza

---

## Overview

Make the "Toque para alterar" (dealer change) button visible not only during the dealer confirmation sub-phase, but also during the bids entry sub-phase (when "Iniciar Rodada" is visible) and during the playing phase. This allows users to correct who is dealing at any point before or during a round. Dealer rotation logic continues to apply correctly after any manual change, carrying the updated dealer index into subsequent rounds.

---

## Problem Statement

Currently, the "Toque para alterar" button — which lets users manually change who deals the cards — is only shown during the `dealer` sub-phase of the bid phase. Once the user advances to entering bids (`bidSubPhase = 'bids'`) or starts the round (playing phase), the button disappears and there is no way to correct the dealer without abandoning the round.

In practice, users often realize they have the wrong dealer only after starting to enter bids or even after the round has begun. Forcing them to back out or restart the round to fix a simple dealer assignment is unnecessary friction.

---

## Goals

- Show the "Toque para alterar" button alongside the "Iniciar Rodada" button (during `bidSubPhase = 'bids'`), so users can change the dealer before starting the round.
- Show the "Toque para alterar" button during the playing phase, so users can change the dealer after the round has started.
- After a manual dealer change, the "Distribui" and "Primeiro palpite" labels must update immediately to reflect the new dealer.
- After a manual dealer change, the automatic dealer rotation for subsequent rounds must derive from the updated dealer, not the original one.
- All existing dealer-rotation rules (skip dead players, circular order) continue to apply.

---

## Non-Goals

- Changes to Modo 2 (Painel Individual).
- Changes to how bids, tricks, scoring, or lives work.
- Changes to the dealer selection UI itself (layout, list, confirm/cancel flow).
- Allowing dealer changes during the manilha sub-phase or the finished/tiebreak phases.
- Changing the automatic rotation logic (only the trigger point is extended).

---

## User Scenarios & Testing

### Scenario 1 — Dealer change button visible during bids entry

**Given** the bid phase is in the `bids` sub-phase with palpite inputs shown  
**When** the user views the screen  
**Then** the "Toque para alterar" button is visible alongside the "Iniciar Rodada" button  
**And** the current "Distribui" and "Primeiro palpite" labels are shown on the correct players

### Scenario 2 — User changes dealer during bids entry

**Given** the "Toque para alterar" button is visible during the bids sub-phase  
**When** the user taps "Toque para alterar" and selects a different dealer  
**Then** the "Distribui" label moves to the newly selected player  
**And** the "Primeiro palpite" label updates to the alive player immediately after the new dealer  
**And** the bids entry screen is still shown (palpite inputs remain)  
**And** the "Iniciar Rodada" button is still visible

### Scenario 3 — Dealer change button visible during playing phase

**Given** the round has been started and the playing phase is active (timer running)  
**When** the user views the screen  
**Then** the "Toque para alterar" button is visible alongside the "Finalizar Rodada" button  
**And** the current "Distribui" and "Primeiro palpite" labels are shown on the correct players

### Scenario 4 — User changes dealer during playing phase

**Given** the "Toque para alterar" button is visible during the playing phase  
**When** the user taps "Toque para alterar" and selects a different dealer  
**Then** the "Distribui" label moves to the newly selected player  
**And** the "Primeiro palpite" label updates to the alive player immediately after the new dealer  
**And** the playing phase continues (timer keeps running, tricks inputs remain active)  
**And** the "Finalizar Rodada" button is still visible

### Scenario 5 — Dealer rotation uses updated dealer in next round

**Given** the user manually changed the dealer to player X during any phase of round N  
**When** round N is finished and round N+1 begins  
**Then** the automatic dealer candidate for round N+1 is the next alive player after X in circular registration order  
**And** the rotation behaves as if X had been the dealer all along

### Scenario 6 — Dealer change with dead player in rotation

**Given** a dead player is between the new dealer and the next alive player  
**When** the user changes the dealer and the "Primeiro palpite" is recalculated  
**Then** dead players are skipped and the "Primeiro palpite" label goes to the next alive player

### Scenario 7 — Cancel dealer change during bids entry

**Given** the user tapped "Toque para alterar" during the bids sub-phase  
**When** the user cancels the dealer change without selecting a new dealer  
**Then** the original dealer remains unchanged  
**And** the bids entry screen is restored with all previously entered palpite values intact

### Scenario 8 — Cancel dealer change during playing phase

**Given** the user tapped "Toque para alterar" during the playing phase  
**When** the user cancels the dealer change without selecting a new dealer  
**Then** the original dealer remains unchanged  
**And** the playing phase is restored with the timer continuing from where it left off

---

## Functional Requirements

### FR-001 — "Toque para alterar" visible during bids sub-phase

The dealer change button must be shown during `bidSubPhase = 'bids'` (the same screen where palpite inputs and "Iniciar Rodada" are shown).

**Acceptance criteria**:
- The "Toque para alterar" button is visible when `bidSubPhase = 'bids'`.
- The button is positioned clearly alongside or near the current dealer/first-bidder labels.
- Tapping the button opens the dealer selection UI.

### FR-002 — "Toque para alterar" visible during playing phase

The dealer change button must be shown during the `playing` phase (the same screen where tricks inputs and "Finalizar Rodada" are shown).

**Acceptance criteria**:
- The "Toque para alterar" button is visible when the game phase is `'playing'`.
- Tapping the button opens the dealer selection UI.
- The timer state during the dealer selection interaction does not affect the timer's running state (timer continues running while the dealer selection UI is open).

### FR-003 — Dealer and first-bidder labels update immediately after change

After the user confirms a new dealer, the "Distribui" and "Primeiro palpite" labels must update in real time.

**Acceptance criteria**:
- "Distribui" label is removed from the previous dealer and applied to the new dealer.
- "Primeiro palpite" label is recalculated and applied to the next alive player after the new dealer, skipping dead players.
- Updates are visible without requiring a page refresh or navigation.

### FR-004 — Dealer index persisted after manual change

The `dealerIndex` in game state must be updated when the user confirms a dealer change during the bids or playing phase.

**Acceptance criteria**:
- After confirming a new dealer, `GameState.dealerIndex` reflects the new dealer's index among alive players.
- The updated `dealerIndex` is used as the basis for the next round's automatic dealer rotation.
- The change persists across app background/foreground cycles (localStorage-backed state).

### FR-005 — Next round rotation derives from updated dealer

After a manual dealer change in round N, the automatic candidate for round N+1 must be derived from the new dealer.

**Acceptance criteria**:
- At the start of round N+1, the pre-selected dealer is the next alive player after the player who was the dealer at the end of round N (whether original or manually changed).
- No special case handling is needed — the rotation simply reads `dealerIndex` from the updated state.

### FR-006 — Bids entry state preserved after dealer change during bids sub-phase

Changing the dealer during the bids sub-phase must not discard any palpite values the user has already entered.

**Acceptance criteria**:
- After a dealer change during `bidSubPhase = 'bids'`, all palpite values entered before the change remain in their input fields.
- The "Iniciar Rodada" button remains enabled (if it was enabled before the change).

### FR-007 — Playing phase state preserved after dealer change during playing phase

Changing the dealer during the playing phase must not interrupt the round in progress.

**Acceptance criteria**:
- After a dealer change during the `'playing'` phase, tricks input values are preserved.
- The timer continues running without reset.
- "Finalizar Rodada" remains available and functional.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Dealer change button visible during bids entry | 100% of rounds in `bidSubPhase = 'bids'` |
| Dealer change button visible during playing phase | 100% of rounds in `playing` phase |
| Labels ("Distribui", "Primeiro palpite") update after change | Immediate — 0 delay after confirmation |
| Next-round rotation uses updated dealer | 100% of rounds following a manual change |
| Bids preserved after dealer change during bids entry | 100% — no data loss |
| Playing phase uninterrupted after dealer change | 100% — timer continues, tricks inputs intact |
| Dead players skipped in first-bidder recalculation | 100% of cases |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Toque para alterar | The dealer change button; previously only visible in `bidSubPhase = 'dealer'`; now also shown in `bidSubPhase = 'bids'` and `playing` phase |
| Dealer (Distribuidor) | The alive player designated to deal cards; tracked via `GameState.dealerIndex` |
| First Bidder (Primeiro Palpite) | The alive player immediately after the dealer in circular registration order; derived, not stored |
| Dealer Selection UI | The existing UI that lists alive players and lets the user pick a dealer; reused without layout changes |
| Dealer Rotation | The automatic rule that advances `dealerIndex` by one alive player each round; unmodified by this feature |

---

## Assumptions

1. The existing "Toque para alterar" dealer selection UI (list + confirm) is reused as-is — no new UI components are needed.
2. Canceling the dealer change during the bids sub-phase restores the bids entry screen without any side effects.
3. The timer is not paused when the dealer selection UI is open; timer management remains unchanged.
4. `firstBidderIndex` in `RoundState` is either derived on the fly or updated when `dealerIndex` changes — the exact storage approach is an implementation detail, but the displayed value must always be correct.
5. In round 1, the dealer change button is visible and usable (unlike the previous spec SPEC-020, which restricted manual changes to round 2+; this feature removes that restriction from the bids and playing phases).

---

## Dependencies

- SPEC-020: Dealer selection flow and tooltip labels ("Distribui", "Primeiro palpite") must be in place.
- `GameState.dealerIndex` must be writable from the bids and playing phase contexts.
- Existing dealer selection UI must be accessible from those phases.

---

## Out of Scope

- Changing the dealer during the `manilha` or `dealer` sub-phases (already handled by existing flow).
- Changing the dealer in the `finished`, `tiebreak`, or `setup` phases.
- Any changes to Modo 2.
- Adding an undo/history for dealer changes.

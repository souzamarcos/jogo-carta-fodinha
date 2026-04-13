# Merge Playing and Result Phases in Mode 1

**Feature ID**: SPEC-022
**Status**: Draft
**Created**: 2026-04-13
**Author**: Marcos Souza

---

## Overview

In Mode 1, eliminate the separate result phase by merging it into the playing phase. After clicking "Iniciar Rodada", the tricks input (number of tricks won) becomes immediately editable alongside the timer. Clicking "Finalizar Rodada" both stops the timer and confirms the result in a single action — skipping the dedicated result phase entirely.

---

## Problem Statement

Currently, the Mode 1 round workflow has three separate steps after bids are recorded:

1. **Playing phase** — Timer runs; bids are displayed but tricks inputs are locked; user must click "Finalizar Rodada" to proceed.
2. **Result phase** — Timer is stopped; tricks inputs become editable; user fills them in and clicks "Confirmar Resultado".
3. Confirmation triggers scoring and moves to the next round.

This two-step sequence creates unnecessary friction: the user must wait for the round to finish and then fill in the results on a separate screen. In practice, the table knows the outcome as soon as the last trick is played and can record results immediately.

---

## Goals

- After clicking "Iniciar Rodada", tricks inputs are immediately active and pre-filled with each player's bid value.
- The timer runs continuously until the user clicks "Finalizar Rodada".
- "Finalizar Rodada" simultaneously stops the timer, validates the tricks inputs, and applies scoring — exactly the behavior of the current "Confirmar Resultado" button.
- The dedicated result phase (separate screen) is eliminated from the Mode 1 flow.
- Bids (palpites) remain visible throughout the playing phase, as they are today.

---

## Non-Goals

- Changes to Mode 2.
- Changes to how bids are entered (bids sub-phase remains unchanged).
- Changes to scoring, lives, or trick calculation logic.
- Changes to the tiebreak or finished phases.
- Changes to the round history table.

---

## User Scenarios & Testing

### Scenario 1 — Tricks inputs are active immediately after starting the round

**Given** the user has completed the bid sub-phase and all players' bids are recorded  
**When** the user clicks "Iniciar Rodada"  
**Then** the playing phase loads with the timer running  
**And** each player's tricks input is visible and editable  
**And** each player's tricks input is pre-filled with that player's bid value  
**And** each player's bid (palpite) value is still displayed alongside the tricks input

### Scenario 2 — User edits tricks during the round

**Given** the playing phase is active with the timer running  
**When** the user changes the tricks value for one or more players  
**Then** the changed values are reflected in real time in the input fields  
**And** the timer continues running without interruption

### Scenario 3 — Finalizar Rodada confirms the result

**Given** the playing phase is active and tricks inputs are filled  
**When** the user clicks "Finalizar Rodada"  
**Then** the timer stops  
**And** the scoring is calculated and applied (same logic as current "Confirmar Resultado")  
**And** the game transitions directly to the bid phase of the next round (or finished/tiebreak if applicable)  
**And** no intermediate result-confirmation screen is shown

### Scenario 4 — Validation prevents finishing with invalid tricks total

**Given** the playing phase is active  
**When** the user clicks "Finalizar Rodada" and the total tricks entered does not equal the number of cards per player  
**Then** the game does not advance  
**And** the user is shown a clear error message indicating the tricks total is incorrect  
**And** the timer continues running

### Scenario 5 — Bid values persist alongside editable tricks inputs

**Given** the playing phase is active  
**When** the user views the player list  
**Then** each player's bid (palpite) is displayed (read-only)  
**And** each player's tricks input shows the pre-filled value (initially equal to the bid)  
**And** both values are visible simultaneously on each player row

### Scenario 6 — No result phase screen appears

**Given** the user has finished the playing phase (clicked "Finalizar Rodada" with valid input)  
**When** the transition occurs  
**Then** the dedicated result phase screen is not shown  
**And** the game goes directly to the next round's bid phase

---

## Functional Requirements

### FR-001 — Tricks inputs active during playing phase

During the playing phase, each alive player must have an editable tricks input visible on their player row.

**Acceptance criteria**:
- Tricks input is enabled (not disabled/locked) as soon as the playing phase loads.
- Tricks input accepts integer values between 0 and the number of cards per player (inclusive).
- Changing a tricks input updates the stored value immediately.

### FR-002 — Tricks inputs pre-filled with bid values

When the playing phase loads, each player's tricks input must be pre-filled with that player's bid.

**Acceptance criteria**:
- Each player's tricks input initial value equals the bid recorded for that player in the bid sub-phase.
- If a player has no bid recorded, the input defaults to 0.
- Pre-fill occurs on load; the user can change the value freely after that.

### FR-003 — Bids remain visible during playing phase

Each player's recorded bid (palpite) must continue to be displayed in read-only form alongside the tricks input.

**Acceptance criteria**:
- The bid value is shown on the player row in a non-editable display.
- The bid display does not change when the user edits the tricks input.

### FR-004 — Timer runs until Finalizar Rodada is clicked

The round timer starts when the playing phase loads and keeps running until the user clicks "Finalizar Rodada".

**Acceptance criteria**:
- Timer starts when the playing phase is entered.
- Timer continues while the user edits tricks inputs.
- Timer stops when "Finalizar Rodada" is clicked (whether the action succeeds or fails validation).

### FR-005 — Finalizar Rodada applies scoring and advances the round

Clicking "Finalizar Rodada" with valid tricks inputs must trigger scoring and transition to the next round, replacing the current "Confirmar Resultado" action.

**Acceptance criteria**:
- The action performs the same scoring calculation as the current "Confirmar Resultado".
- On success, the game moves to the bid phase of the next round (or finished/tiebreak state).
- The dedicated result phase screen is no longer shown in the flow.

### FR-006 — Tricks total validation before advancing

The game must not advance if the total tricks entered across all players does not equal the number of cards per player for the round.

**Acceptance criteria**:
- Validation runs when "Finalizar Rodada" is clicked.
- If total tricks ≠ cards per player, the game stays in the playing phase and shows an error.
- If total tricks = cards per player, the round advances normally.

### FR-007 — Result phase removed from Mode 1 flow

The dedicated result phase (separate screen with "Confirmar Resultado" button) must be eliminated from the Mode 1 gameplay loop.

**Acceptance criteria**:
- After a successful "Finalizar Rodada", the result phase screen does not appear.
- The `GamePhase` transitions from `'playing'` directly to `'bid'` (or `'finished'`/`'tiebreak'`) without passing through `'result'`.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Round completion time (bid confirmed → next round started) | Reduced compared to current two-step flow |
| Steps to complete a round after bids are recorded | 1 click ("Finalizar Rodada") instead of 2 ("Finalizar" + "Confirmar") |
| Tricks inputs editable throughout playing phase | 100% of rounds |
| Tricks pre-filled with bid values on load | 100% of rounds, all players |
| Timer runs continuously until "Finalizar Rodada" | 100% of rounds |
| Scoring accuracy (same as current confirm-result logic) | 100% of rounds |
| Invalid tricks total blocked | 100% of invalid submissions rejected with feedback |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Playing Phase | The phase active after "Iniciar Rodada"; now merges display of bids and editable tricks |
| Result Phase | Eliminated from Mode 1 flow; its responsibilities are absorbed by the playing phase |
| Tricks Input | Editable field per player for recording tricks won; pre-filled with bid value |
| Bid Display | Read-only display of each player's recorded palpite; remains visible during playing phase |
| Timer | Counts elapsed time for the round; runs until "Finalizar Rodada" is clicked |
| Finalizar Rodada | Button that was previously only "end playing phase"; now also applies scoring |

---

## Assumptions

1. The existing tricks-validation logic (total tricks = cards per player) used in "Confirmar Resultado" is reused without change.
2. The existing scoring logic applied by "Confirmar Resultado" is moved into the "Finalizar Rodada" action without modification.
3. The `'result'` GamePhase value may be retained in the state machine for tiebreak/future use, but the result phase screen will not be shown during the normal Mode 1 flow.
4. Pre-filling tricks with bid values is the best default — most rounds end with each player achieving their bid, so this minimizes edits needed.
5. The timer stop behavior on "Finalizar Rodada" remains identical to the current behavior.

---

## Dependencies

- Existing tricks-validation logic (currently in result phase action).
- Existing scoring/lives calculation logic (currently triggered by "Confirmar Resultado").
- `RoundState.tricks` record (already in the data model).
- `RoundState.bids` record (used to pre-fill tricks inputs).

---

## Out of Scope

- Changing the bid entry sub-phases (manilha → dealer → bids).
- Any changes to Mode 2.
- Adding auto-save or draft state for partially entered tricks.
- Changing the timer display or format.

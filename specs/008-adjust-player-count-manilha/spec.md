# Adjust Player Count During Manilha Selection (Modo 2)

**Feature ID**: SPEC-026
**Status**: Draft
**Created**: 2026-04-18
**Author**: Marcos Souza

---

## Overview

In Modo 2 (Painel Individual), the number of active players is configured once when the session begins and never changes. However, players can be eliminated between rounds, reducing the actual count at the table. This feature adds an easy-to-tap increment/decrement control on the Etapa 1 (manilha selection) screen so the user can adjust the player count before each new round begins, keeping the card distribution calculation accurate.

---

## Problem Statement

When using Modo 2 (Painel Individual), a player tracks their own hand and other players' cards independently. The number of players entered at session start is used to calculate how many cards remain on the table. After each round, one or more players may be eliminated from the physical game, but the stored player count stays fixed — leading to incorrect card counts and table state for subsequent rounds.

There is currently no way to reduce (or increase) the player count between rounds without restarting the entire session, which forces users to lose all round history and re-enter all setup data.

---

## Goals

- Display a player count control on the Etapa 1 (manilha selection) screen in Modo 2 that allows the user to increase or decrease the current value.
- The control must be easy to tap on a mobile touchscreen (sufficiently large touch targets).
- Changing the count takes effect immediately and is used in all subsequent calculations for that round (card distribution, table card tracking).
- The updated count persists into the next round's setup without requiring additional input unless the count changes again.

---

## Non-Goals

- Changing player count in Modo 1 (Painel do Mestre).
- Adding player elimination tracking or "lives" management to Modo 2.
- Changing player count during Etapa 2 (hand setup) or Etapa 3/4 (play screen).
- Syncing Modo 2 player count with any Modo 1 game state.
- Adding named players or player profiles to Modo 2.

---

## User Scenarios & Testing

### Scenario 1 — Player count control is visible on Etapa 1

**Given** the user is on the Etapa 1 (manilha selection) screen in Modo 2  
**When** the screen loads at the start of any round  
**Then** a player count control is visible showing the current number of players  
**And** the control has a "decrease" button and an "increase" button flanking the count

### Scenario 2 — User decreases player count before selecting manilha

**Given** the player count is 4 on Etapa 1  
**When** the user taps the decrease button once  
**Then** the displayed count changes to 3  
**And** no other state changes occur until the user confirms the manilha

### Scenario 3 — User increases player count before selecting manilha

**Given** the player count is 3 on Etapa 1  
**When** the user taps the increase button once  
**Then** the displayed count changes to 4

### Scenario 4 — Lower bound prevents count below minimum

**Given** the player count is 2 on Etapa 1  
**When** the user taps the decrease button  
**Then** the count remains at 2 (or the decrease button is disabled)  
**And** no error message is required

### Scenario 5 — Upper bound prevents count above maximum

**Given** the player count is at the maximum allowed value on Etapa 1  
**When** the user taps the increase button  
**Then** the count remains at the maximum (or the increase button is disabled)

### Scenario 6 — Updated count used in round calculations

**Given** the user reduced the player count from 4 to 3 on Etapa 1  
**When** the user selects the manilha and proceeds to Etapa 2 (hand setup)  
**Then** the number of cards distributed to other players is recalculated using the count of 3  
**And** the table card tracking in Etapa 3/4 reflects the updated player count

### Scenario 7 — Updated count persists to next round

**Given** the user reduced the player count to 3 and completed the round  
**When** Etapa 1 loads for the next round  
**Then** the displayed count is 3 (the value saved from the previous round)  
**And** the user can adjust it again if another elimination occurred

### Scenario 8 — Count unchanged if user does not interact with the control

**Given** the user opens Etapa 1 without touching the player count control  
**When** the user selects the manilha and proceeds  
**Then** the player count used in the round is the same as the previous round's count  
**And** no change in game behavior occurs compared to today

---

## Functional Requirements

### FR-001 — Player count control displayed on Etapa 1

A player count adjustment control must be visible on the Etapa 1 screen in Modo 2 on every round (including the first).

**Acceptance criteria**:
- The control is visible on the ManilhaSetupScreen (Etapa 1) in PlayerPage.
- The control shows the current `numPlayers` value.
- The control is present from the very first round of a session.

### FR-002 — Decrease button reduces player count

**Acceptance criteria**:
- Tapping the decrease button reduces `numPlayers` by 1.
- The displayed count updates immediately.
- The decrease button is disabled (or tapping has no effect) when `numPlayers` is at the minimum allowed value (2).

### FR-003 — Increase button raises player count

**Acceptance criteria**:
- Tapping the increase button increases `numPlayers` by 1.
- The displayed count updates immediately.
- The increase button is disabled (or tapping has no effect) when `numPlayers` is at the maximum allowed value (10).

### FR-004 — Touch target size meets usability standard

**Acceptance criteria**:
- Each button (decrease and increase) has a tap area of at least 44×44 CSS pixels.
- Buttons are spaced so adjacent controls cannot be accidentally triggered together on a typical mobile screen.

### FR-005 — Updated count applied to round calculations

When the user proceeds past Etapa 1, all card-count calculations for that round must use the updated `numPlayers` value.

**Acceptance criteria**:
- `cardsPerPlayer` is recalculated from the updated `numPlayers` (and current round number) when the manilha is confirmed.
- The number of "other player" card slots shown in Etapa 2 and Etapa 3/4 matches the updated `numPlayers - 1` (other players, excluding self).
- No stale value from the previous round is used.

### FR-006 — Updated count persists into subsequent rounds

**Acceptance criteria**:
- After completing a round, the `numPlayers` value in the store reflects the count last set by the user.
- When Etapa 1 loads for the next round, the displayed count equals the value saved from the previous round.

### FR-007 — Session initialization count unchanged

**Acceptance criteria**:
- The initial `numPlayers` shown on the first round's Etapa 1 is the value entered by the user on the session configuration screen.
- The configuration screen retains its current behavior and is not modified by this feature.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Player count control visible on every Etapa 1 screen | 100% of rounds in all Modo 2 sessions |
| Tap targets meet minimum size standard | Both buttons ≥ 44×44 CSS px |
| Card calculations use updated count after adjustment | 100% of rounds where count was changed |
| Updated count carries forward automatically to next round | 100% — no re-entry required |
| Minimum/maximum bounds respected | 100% — control prevents out-of-range values |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Player Count Control | New UI element on Etapa 1 in Modo 2 — shows current `numPlayers` with decrease (−) and increase (+) buttons |
| numPlayers | Stored integer in `PlayerHandState` representing the number of active players for the current session; mutable via the new control |
| Etapa 1 / ManilhaSetupScreen | First step of each Modo 2 round where the user selects the manilha value; hosts the new control |
| cardsPerPlayer | Derived value recalculated when `numPlayers` changes; determines how many cards each player receives |

---

## Assumptions

1. The valid range for `numPlayers` in Modo 2 is 2–10, matching the initial session configuration constraints (assumed from common card game conventions; to be confirmed against existing validation).
2. The player count control is placed near the top of the Etapa 1 screen, above the manilha value grid, so it is clearly associated with session context rather than with card selection.
3. Adjusting the count on Etapa 1 does not affect the session history or any prior round data — it only affects the current and future rounds.
4. The user is responsible for keeping the count in sync with the physical table; the app provides no automatic elimination tracking.
5. `cardsPerPlayer` recalculation on count change uses the same formula already in place: `min(round, floor(40 / numPlayers))`.

---

## Dependencies

- `playerHandStore.ts`: `numPlayers` must become mutable (add an `updateNumPlayers(n: number)` action or equivalent); currently it is set only once at `initSession()`.
- `PlayerPage.tsx` — `ManilhaSetupScreen`: add the control component and wire it to the store action.

---

## Out of Scope

- Any changes to Modo 1 player count handling.
- Automatic player elimination detection in Modo 2.
- History or audit trail of player count changes within a session.
- Fractional or non-integer player counts.
- UI changes to the session configuration screen (ConfigScreen).

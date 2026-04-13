# Dealer Selection Flow and Player Order Stabilization

**Feature ID**: SPEC-020
**Status**: Draft
**Created**: 2026-04-13
**Author**: Marcos Souza

---

## Overview

In Modo 1 (Suporte Geral), introduce a dealer selection step between manilha selection and palpite entry. Player names must always appear in the same registration order throughout all game phases, with tooltips indicating who deals and who bids first. The dealer role advances one position per round in circular order.

---

## Problem Statement

Currently in Modo 1, the palpite (bid) input is shown immediately when the bid phase begins, before the manilha is chosen. Additionally, players are reordered on screen based on who bids first each round, making it hard to track the overall game state visually. There is no explicit visual indicator or step to confirm who is dealing the cards each round.

---

## Goals

- Make the game setup flow clearer by requiring manilha selection before bids are entered.
- Introduce an explicit dealer confirmation step that informs all participants who deals and who bids first.
- Stabilize player name order on screen so the same player is always in the same row, reducing cognitive load.
- Automate dealer rotation round-over-round while allowing manual correction.

---

## Non-Goals

- Changes to Modo 2 (Painel Individual) or any other game mode.
- Changes to how lives, tricks, or scoring are calculated.
- Changes to the manilha selection UI itself.
- Changing who is eligible to deal (dead/eliminated players are skipped per existing logic).

---

## User Scenarios & Testing

### Scenario 1 — Round 1 bid phase: palpite hidden until manilha selected

**Given** the game has just started (Round 1) and the bid phase begins  
**When** the bid phase screen loads  
**Then** the palpite (bid) input section is not visible  
**And** only the manilha selection is shown

### Scenario 2 — Manilha selected, dealer selection step appears

**Given** the bid phase screen is showing the manilha selector  
**When** the user selects a manilha value  
**Then** the palpite section remains hidden  
**And** a dealer selection step appears showing all alive players in registration order  
**And** the player recommended as dealer (based on automatic rotation) is indicated  
**And** each player name shows a tooltip on hover/focus: the dealer candidate shows "Distribui" and the next player in order shows "Primeiro palpite"

### Scenario 3 — Dealer confirmed, palpite section becomes visible

**Given** the dealer selection step is shown  
**When** the user confirms (or changes and confirms) who deals  
**Then** the dealer selection step is replaced by the palpite input section  
**And** the palpite inputs are shown for all alive players in registration order  
**And** the player with the "Distribui" tooltip and the "Primeiro palpite" tooltip remain visible on the player names throughout the bid phase

### Scenario 4 — Player order is consistent across all phases

**Given** the game is in any phase (bid, playing, result)  
**When** the player list is displayed  
**Then** players always appear in the same top-to-bottom registration order  
**And** only the tooltip labels ("Distribui", "Primeiro palpite") change per round — the row position of each player never changes

### Scenario 5 — Dealer rotates automatically each round

**Given** player A dealt in round N  
**When** round N+1 begins  
**Then** the next alive player after A (in circular registration order) is automatically selected as the dealer candidate  
**And** the player after the new dealer is automatically indicated as "Primeiro palpite"

### Scenario 6 — Manual dealer correction in round 2+

**Given** the game is in round 2 or later and the dealer selection step is displayed  
**When** the user wants to correct who deals  
**Then** an edit option is available to select a different dealer from the list of alive players  
**And** after selecting a new dealer, the "Primeiro palpite" indicator updates to the next alive player after the new dealer

### Scenario 7 — First round has no edit option

**Given** the game is in round 1 and the dealer selection step is shown  
**Then** no edit/change option is shown (the user can only confirm the pre-selected dealer)

### Scenario 8 — Dead players skipped in rotation

**Given** a player between the current dealer and next dealer position is eliminated  
**When** the round advances  
**Then** the rotation skips the dead player and the next alive player in order becomes the dealer candidate

---

## Functional Requirements

### FR-001 — Palpite section hidden until manilha is selected

At the start of each round's bid phase, the palpite input section must not be visible until the user has selected a manilha value.

**Acceptance criteria**:
- Palpite inputs are not rendered or are visually hidden when no manilha has been selected.
- Once a manilha value is selected, the palpite inputs do not appear immediately — the dealer selection step is shown first.

### FR-002 — Dealer selection step after manilha selection

After a manilha value is selected, a dealer selection step is shown before the palpite inputs.

**Acceptance criteria**:
- The dealer selection step is shown after manilha selection and before palpite entry in every round.
- The step displays all alive players in registration order.
- The automatically determined dealer candidate is pre-selected/highlighted.
- The user must explicitly confirm (or change) the dealer before proceeding to palpite entry.

### FR-003 — Dealer tooltip on player name

The player designated as dealer must show a "Distribui" tooltip on their name throughout the bid phase.

**Acceptance criteria**:
- The "Distribui" tooltip is visible on the dealer's name row in the dealer selection step.
- The tooltip remains visible on the player's name during the palpite entry step.
- The tooltip is visible (via hover or persistent label) during the playing and result phases of that round.

### FR-004 — First bidder tooltip on player name

The alive player immediately after the dealer in circular registration order must show a "Primeiro palpite" tooltip on their name.

**Acceptance criteria**:
- The "Primeiro palpite" tooltip is visible on the correct player's name in the dealer selection step.
- The tooltip updates immediately if the dealer is changed during the dealer selection step.
- The tooltip remains visible during palpite entry, playing, and result phases of that round.

### FR-005 — Stable player name order across all phases

Players must be displayed in the same top-to-bottom order (registration order) in all phases of every round.

**Acceptance criteria**:
- In the dealer selection step, palpite entry, playing phase, and result phase, players appear in registration order.
- Player row position does not change between phases or rounds.
- Dead players remain visible in their registered position (with appropriate visual treatment indicating elimination).

### FR-006 — Automatic dealer rotation per round

The dealer role advances one position per round in circular registration order, skipping dead players.

**Acceptance criteria**:
- In round N+1, the dealer candidate is the next alive player after the round N dealer, following registration order circularly.
- If the next player in order is dead, the rotation continues to the next alive player.
- The rotation persists across rounds and is reflected in the pre-selected dealer in the dealer selection step.

### FR-007 — Manual dealer edit available from round 2 onwards

From round 2 onwards, the user can change the dealer in the dealer selection step.

**Acceptance criteria**:
- An edit/change control is visible in the dealer selection step from round 2 onward.
- The user can select any alive player as the dealer.
- After a manual change, the "Primeiro palpite" tooltip updates to the next alive player after the newly selected dealer.
- In round 1, no edit control is shown; only confirmation is available.

### FR-008 — Tooltips update when dealer is changed manually

When the user changes the dealer during the dealer selection step, the tooltip assignments must update in real time.

**Acceptance criteria**:
- Selecting a new dealer immediately removes "Distribui" from the previous dealer and adds it to the new one.
- The "Primeiro palpite" tooltip moves to the alive player immediately after the new dealer.

---

## Success Criteria

| Criterion | Target |
|-----------|--------|
| Palpite section hidden before manilha selection | Always hidden — 0% chance of entering bids before manilha |
| Dealer selection step visible after manilha | Shown in 100% of rounds before palpite entry |
| Player row order consistency | 0 position changes across phases and rounds for any player |
| Dealer rotation correctness | Correct next-alive-player selected in 100% of automatic rotations |
| Tooltip accuracy | "Distribui" and "Primeiro palpite" always on correct players |
| Manual dealer edit available from round 2 | Edit option present in 100% of round 2+ dealer selection steps |

---

## Key Entities

| Entity | Description |
|--------|-------------|
| Dealer (Distribuidor) | The alive player who deals cards for the current round; indicated by "Distribui" tooltip |
| First Bidder (Primeiro Palpite) | The alive player immediately after the dealer in circular registration order; indicated by "Primeiro palpite" tooltip |
| Registration Order | The order players were added during game setup; this order never changes during the game |
| Dealer Selection Step | A new UI step shown after manilha selection and before palpite entry, where the dealer is confirmed or changed |
| Circular Rotation | Each round the dealer role advances by one alive player position, wrapping from last back to first |

---

## Assumptions

1. "Registration order" corresponds to the `position` field on each player, assigned at game setup.
2. In round 1, the first dealer is the first player in registration order (position 0 among alive players).
3. Dead players retain their visual row but are visually distinguished (e.g., strikethrough, reduced opacity) and are skipped in dealer/first-bidder rotation.
4. The tooltip can be implemented as a persistent label (always visible) or a hover/focus tooltip — the exact presentation is an implementation decision, but the information must be accessible.
5. The dealer selection step does not require selecting the first bidder explicitly; the first bidder is always derived automatically as the next alive player after the dealer.
6. If all players except one are dead, that player is both the dealer and the "Primeiro palpite" (edge case for near-end-of-game state).

---

## Dependencies

- Existing manilha selection step in the bid phase must complete before the dealer selection step is shown.
- Existing player registration order (`position` field) must be populated correctly at game start.
- Existing alive/dead player state must be accessible to determine rotation correctly.

---

## Out of Scope

- Changes to Modo 2 or other game modes.
- Changing the scoring, lives, or trick calculation logic.
- Reordering players in the registration/setup screen.
- Adding a dealer indicator to the round history table.

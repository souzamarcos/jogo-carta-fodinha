# player-ordering Specification

## Purpose

Defines stable player ordering in Modo 1 — players always appear in the same registration order across all phases — and the ability to edit the seating order mid-game from the bids sub-phase and playing phase, recalculating the first bidder while preserving the dealer identity and round data. (Incorporates SPEC-020 stable-order requirement and SPEC-024.)

## Requirements

### Requirement: Stable Player Order Across Phases

The system SHALL display players in the same top-to-bottom registration order in every phase of every round; a player's row position never changes between phases or rounds, and eliminated players keep their position with elimination styling.

#### Scenario: Order consistent across phases
- **WHEN** the player list is shown in the dealer step, bids, playing, or result display
- **THEN** players appear in registration order and no player's row position changes between phases or rounds

### Requirement: Edit Player Order Mid-Game

The system SHALL provide an "Editar ordem dos jogadores" control during the bids sub-phase and the playing phase that opens a reorder modal listing alive players in current order, with up/down controls (first row has no up, last row has no down) and Confirm/Cancel buttons.

#### Scenario: Reorder modal contents
- **WHEN** the user opens "Editar ordem dos jogadores"
- **THEN** a modal lists alive players in current order with up/down controls and Confirm and Cancel buttons

#### Scenario: Confirming updates positions
- **WHEN** the user confirms a new order
- **THEN** player `position` values update, `alivePlayers()` returns the new order, and the change is persisted

### Requirement: First Bidder Recalculation Preserving Dealer

The system SHALL, after an order change, keep the "Distribui" label on the same player (updating `dealerIndex` to still point to them) and recalculate "Primeiro palpite" as the first alive player after the dealer in the new order, updating `firstBidderIndex` without a refresh.

#### Scenario: Dealer identity preserved
- **WHEN** the player order is changed
- **THEN** the "Distribui" label stays on the same player and `dealerIndex` is updated to keep pointing to them

#### Scenario: First bidder updates
- **WHEN** the player order is changed
- **THEN** "Primeiro palpite" is recalculated as the first alive player after the dealer in the new order, immediately

### Requirement: Round Data and Timer Preserved on Reorder

The system SHALL keep `bids` and `tricks` entries (keyed by player ID) unchanged across a reorder, not reset the playing-phase timer, and carry the new order into subsequent rounds including dealer rotation.

#### Scenario: Bids and tricks survive reorder
- **WHEN** the order is changed during bids or playing
- **THEN** `currentRound.bids` and `currentRound.tricks` are unchanged (still keyed by player ID)

#### Scenario: Timer not interrupted
- **WHEN** the reorder modal is opened, confirmed, or cancelled during the playing phase
- **THEN** the timer continues running and is not reset

#### Scenario: Order carries forward
- **WHEN** the next round begins after an order change
- **THEN** `alivePlayers()` uses the updated order and dealer rotation advances within it

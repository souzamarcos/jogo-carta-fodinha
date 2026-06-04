# mode2-round-setup Specification

## Purpose

Defines Modo 2 (Painel Individual) session configuration and per-round setup at `/player`: entering the player name and table size, the player-count stepper and manilha selection (Etapa 1), and the hand-entry grid (Etapa 2). Modo 2 is fully independent of Modo 1 state. (Incorporates the base spec plus SPEC-026.)

## Requirements

### Requirement: Session Configuration

The system SHALL, on a new Modo 2 session, require a free-text player name and an integer table size (`numPlayers` ≥ 2), then initialize `round = 1`, `cardsPerPlayer = 1`, with state stored independently of Modo 1.

#### Scenario: Configuring a new session
- **WHEN** the user enters a name and a table size and confirms
- **THEN** the session starts at `round = 1`, `cardsPerPlayer = 1`, persisted under the Modo 2 store with no reference to Modo 1 state

### Requirement: Player Count Stepper on Etapa 1

The system SHALL display a player-count control on the Etapa 1 (manilha) screen every round (including the first), showing `numPlayers` flanked by decrease/increase buttons with tap targets ≥ 44×44 CSS px, bounded to 2..10.

#### Scenario: Control visible on Etapa 1
- **WHEN** the Etapa 1 screen loads at the start of any round
- **THEN** the player-count control is shown with the current `numPlayers` and decrease/increase buttons

#### Scenario: Adjusting the count
- **WHEN** the user taps decrease or increase
- **THEN** `numPlayers` changes by 1 immediately, clamped to the range 2..10 (the button at a bound is disabled or a no-op)

### Requirement: Manilha Selection (Etapa 1)

The system SHALL provide a manilha selector (value + required suit) in Etapa 1; confirming shows the manilha in focus and reveals Etapa 2 with the manilha row pre-populated. Etapa 2 only appears after Etapa 1 is confirmed.

#### Scenario: Confirming the manilha advances to hand entry
- **WHEN** the user confirms a manilha value and suit
- **THEN** the manilha is shown in focus and Etapa 2 appears with the manilha's four suits pre-populated in the grid

### Requirement: Updated Count Drives Round Calculations

The system SHALL recalculate `cardsPerPlayer` as `min(round, floor(40 / numPlayers))` when the manilha is confirmed, using the current `numPlayers`, and carry the adjusted `numPlayers` into subsequent rounds without re-entry.

#### Scenario: Recalculation uses the adjusted count
- **WHEN** the user changed `numPlayers` then confirms the manilha
- **THEN** `cardsPerPlayer` and the other-player card slots are computed from the updated `numPlayers`, with no stale value used

#### Scenario: Count persists to next round
- **WHEN** a round completes after the count was adjusted
- **THEN** the next round's Etapa 1 shows the adjusted `numPlayers` as the starting value

### Requirement: Hand Entry Grid (Etapa 2)

The system SHALL present a two-section value grid for entering the user's hand: a top row of 9 non-manilha values each with an availability badge `possível(V) = 4 − count already added with value V` (badge 0 disables the button), and a bottom manilha row of 4 suits each with badge 0 or 1 (an already-added suit disabled). Added cards are listed below with an "×" to remove each; the grid disables all input once `cardsPerPlayer` cards are added.

#### Scenario: Availability badge disables exhausted values
- **WHEN** all four cards of a non-manilha value have been accounted for
- **THEN** that value's button shows badge 0 and is disabled in the hand grid

#### Scenario: Hand grid locks at the hand size
- **WHEN** the number of added hand cards reaches `cardsPerPlayer`
- **THEN** the grid disables all further input

#### Scenario: Starting the round
- **WHEN** the manilha is set and at least one hand card has been added
- **THEN** the "Iniciar Rodada" button is enabled

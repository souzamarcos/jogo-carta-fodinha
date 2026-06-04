# round-flow Specification

## Purpose

Defines the Modo 1 (Suporte Geral) round lifecycle at `/game/round`: the bid phase (manilha selection then bids), the merged playing phase (tricks editable while the timer runs), and round finalization (validation, scoring, and advancing). The dedicated "result" phase from the original design has been removed — finalizing happens in the playing phase. (Incorporates SPEC-022.)

## Requirements

### Requirement: Lives Panel

The system SHALL display each player in seating order with their remaining lives, color-coded green for `lives > 3`, yellow for `lives === 3`, red for `lives <= 2`, and grey out / strike through eliminated players (`alive = false`).

#### Scenario: Lives color coding
- **WHEN** a player has 3 lives
- **THEN** that player's life indicator is yellow

#### Scenario: Eliminated player shown distinctly
- **WHEN** a player is `alive = false`
- **THEN** that player is greyed out / struck through in the lives panel

### Requirement: Round Information

The system SHALL show the current round number, cards per player for the round, who is dealing, and who bids first.

#### Scenario: Round info displayed
- **WHEN** a round is in progress
- **THEN** the round number, cards per player, dealer, and first bidder are displayed

### Requirement: Manilha Selection in Bid Phase

The system SHALL, at the start of the bid phase, require the user to select the manilha (value then suit) and keep the palpite (bid) inputs hidden until a manilha value has been selected.

#### Scenario: Bids hidden before manilha
- **WHEN** the bid phase begins and no manilha is selected
- **THEN** the palpite inputs are not shown and only the manilha selector is visible

#### Scenario: Selecting the manilha
- **WHEN** the user selects a manilha value and suit
- **THEN** the selected manilha card is displayed and the flow proceeds toward bid entry

### Requirement: Bid Entry

The system SHALL provide a numeric stepper per player in bid order, defaulting each to the player's previous-round bid (0 in round 1), highlight the current bidder, and enable "Iniciar Rodada" only once every player has a bid set.

#### Scenario: Default bid values
- **WHEN** the bids sub-phase loads in round 2 or later
- **THEN** each player's bid input defaults to that player's previous-round bid

#### Scenario: Start enabled when all bids set
- **WHEN** every alive player has a bid value
- **THEN** the "Iniciar Rodada" button is enabled

### Requirement: Playing Phase with Editable Tricks

The system SHALL, on entering the playing phase, show the manilha in focus, run a timer (mm:ss) from phase entry, display each player's bid read-only, and provide a tricks input per player (integers 0..cardsPerPlayer) pre-filled with that player's bid.

#### Scenario: Tricks active immediately with bid defaults
- **WHEN** the playing phase loads
- **THEN** each player's tricks input is active and pre-filled with that player's bid (0 if none), the bid remains visible read-only, and the timer is running

#### Scenario: Editing tricks does not change the bid
- **WHEN** the user edits a player's tricks value
- **THEN** that player's displayed bid value is unchanged

### Requirement: Finalize Round with Validation and Scoring

The system SHALL, on "Finalizar Rodada", validate that total tricks equals cards per player; if not, stay in the playing phase with an error; if valid, stop the timer, apply scoring (`lives -= |bid − tricks|`), append a history entry, and advance directly from `playing` to the next round's `bid` (or to `finished` / `tiebreak`) with no separate result phase.

#### Scenario: Invalid trick total blocks advance
- **WHEN** "Finalizar Rodada" is tapped and the total tricks does not equal cards per player
- **THEN** the game stays in the playing phase and shows an error message

#### Scenario: Valid round advances directly
- **WHEN** "Finalizar Rodada" is tapped and total tricks equals cards per player
- **THEN** scoring is applied, a history entry is appended, and the game advances directly to the next round's bid phase (or to finished/tiebreak), without showing a separate result screen

#### Scenario: Round advances dealer and card count
- **WHEN** a round advances to the next bid phase
- **THEN** `round` increments, `cardsPerPlayer` is recalculated, and the dealer advances to the next alive player

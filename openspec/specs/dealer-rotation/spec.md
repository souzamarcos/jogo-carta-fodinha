# dealer-rotation Specification

## Purpose

Defines the Modo 1 dealer selection step, automatic circular rotation, the "Distribui" / "Primeiro palpite" labels that persist across all round phases, and manual dealer changes available in the bids sub-phase and playing phase. (Incorporates SPEC-020, SPEC-021, SPEC-023.)

## Requirements

### Requirement: Dealer Selection Step

The system SHALL, after the manilha is selected and before bid entry, show a dealer selection step (`bidSubPhase = 'dealer'`) listing all alive players in registration order with the rotation-determined dealer candidate pre-selected; the user confirms (or changes) the dealer before the bid inputs appear.

#### Scenario: Dealer step appears after manilha
- **WHEN** the user selects a manilha value in the bid phase
- **THEN** the dealer selection step is shown with alive players in registration order and the rotation candidate pre-selected, before palpite inputs appear

#### Scenario: Confirming the dealer reveals bids
- **WHEN** the user confirms the dealer
- **THEN** the dealer step is replaced by the palpite inputs (`bidSubPhase = 'bids'`)

### Requirement: Automatic Dealer Rotation

The system SHALL advance the dealer one position per round in circular registration order, skipping eliminated players, persisting `dealerIndex`.

#### Scenario: Dealer advances each round
- **WHEN** round N+1 begins after player A dealt in round N
- **THEN** the next alive player after A in circular registration order is the pre-selected dealer candidate

#### Scenario: Dead players skipped
- **WHEN** the next player in rotation order is eliminated
- **THEN** rotation continues to the next alive player

### Requirement: Persistent Dealer and First-Bidder Labels

The system SHALL show a "Distribui" label on the dealer and a "Primeiro palpite" label on the alive player immediately after the dealer (circular registration order), visible across the dealer step, bids sub-phase, playing phase, and any result display of that round.

#### Scenario: Labels persist through playing phase
- **WHEN** the round is in the playing phase
- **THEN** the "Distribui" label is on the dealer's card and "Primeiro palpite" is on the first bidder's card

#### Scenario: First bidder derived from dealer
- **WHEN** the dealer is set
- **THEN** "Primeiro palpite" is assigned to the next alive player after the dealer in circular order

### Requirement: Manual Dealer Change

The system SHALL provide a dealer-change control during the bids sub-phase and the playing phase (available from round 1), updating the labels immediately, persisting the new `dealerIndex`, and preserving entered bids/tricks and the running timer.

#### Scenario: Change available in round 1
- **WHEN** the bids sub-phase or playing phase is shown in round 1
- **THEN** a dealer-change control ("Toque para alterar" / "Editar distribuidor") is available

#### Scenario: Labels update on manual change
- **WHEN** the user selects a new dealer
- **THEN** "Distribui" moves to the new dealer and "Primeiro palpite" moves to the next alive player after them, immediately

#### Scenario: State preserved across the change
- **WHEN** the dealer is changed during the bids sub-phase or playing phase
- **THEN** previously entered bids or tricks are preserved, the playing-phase timer keeps running, and the relevant action button stays enabled

#### Scenario: Next round derives from updated dealer
- **WHEN** the dealer was manually changed and the round ends
- **THEN** round N+1's pre-selected dealer is the next alive player after the dealer in effect at the end of round N

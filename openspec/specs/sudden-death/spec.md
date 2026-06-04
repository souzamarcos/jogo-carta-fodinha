# sudden-death Specification

## Purpose

Defines the Modo 1 tiebreak handling (`phase: 'tiebreak'`) when two or more players are eliminated in the same round: offering a declared draw or extra rounds among the tied players, with automatic re-runs until a single survivor emerges.

## Requirements

### Requirement: Tiebreak Trigger and Options

The system SHALL set `phase = 'tiebreak'` when two or more players reach `lives <= 0` in the same round and present a modal offering "Declarar Empate" and "Rodada Extra".

#### Scenario: Tiebreak modal appears
- **WHEN** two or more players reach 0 lives in the same round
- **THEN** `phase` becomes `tiebreak` and a modal offers "Declarar Empate" and "Rodada Extra"

### Requirement: Declared Draw

The system SHALL, when "Declarar Empate" is chosen, set `phase = 'finished'` and treat all tied players as co-winners on the winner screen.

#### Scenario: Declaring a draw
- **WHEN** the user chooses "Declarar Empate"
- **THEN** the game finishes and all tied players are shown as co-winners

### Requirement: Extra Rounds

The system SHALL, when "Rodada Extra" is chosen, run the normal round flow (bid → playing) among only the tied players starting at 1 card, excluding previously eliminated players; the participant who loses more lives is eliminated and the survivor wins.

#### Scenario: Extra round among tied players
- **WHEN** the user chooses "Rodada Extra"
- **THEN** an extra round runs only among the tied players, starting at 1 card with cards incrementing normally

#### Scenario: Survivor wins the extra round
- **WHEN** an extra round ends and one participant lost more lives than the other(s)
- **THEN** the one who lost fewer lives is declared the winner and the game finishes

### Requirement: Automatic Re-run on Repeated Tie

The system SHALL automatically start a new extra round, without prompting again, when an extra round ends in an equal loss, with no limit on the number of extra rounds.

#### Scenario: Repeated tie re-runs automatically
- **WHEN** an extra round ends with participants losing equal lives
- **THEN** a new extra round starts automatically without asking the user again

### Requirement: Tiebreak State Persistence

The system SHALL persist the `tiebreak` state so a mid-tiebreak reload restores the in-progress extra round.

#### Scenario: Resuming a tiebreak after reload
- **WHEN** the app is reopened during a tiebreak
- **THEN** the `tiebreak` state is restored and the in-progress extra round resumes

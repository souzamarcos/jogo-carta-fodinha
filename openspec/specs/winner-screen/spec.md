# winner-screen Specification

## Purpose

Defines the Modo 1 end-of-game screen (`/game/winner`): showing the winner(s), a match summary, and rematch/home actions.

## Requirements

### Requirement: Winner Display

The system SHALL display the winner's name prominently, and in a declared sudden-death draw show all co-winners.

#### Scenario: Single winner
- **WHEN** the game finished with one survivor
- **THEN** that player's name is displayed prominently as the winner

#### Scenario: Co-winners on declared draw
- **WHEN** the game finished via a declared sudden-death draw
- **THEN** all tied players are shown as co-winners

### Requirement: Match Summary

The system SHALL show a summary with the total rounds played and total elapsed time (from `startedAt` to `finishedAt`).

#### Scenario: Summary shown
- **WHEN** the winner screen loads
- **THEN** it shows the total rounds played and total time

### Requirement: Rematch and Home Actions

The system SHALL provide a "Revanche" button that restarts `GameState` with the same players in the same order and lives reset to 5 (navigating to the round screen), and an "Início" button that clears `gameStore` and returns to `/`.

#### Scenario: Rematch keeps players
- **WHEN** the user taps "Revanche"
- **THEN** a new match starts with the same players in the same order, all lives reset to 5

#### Scenario: Returning home clears state
- **WHEN** the user taps "Início"
- **THEN** `gameStore` is cleared and the app navigates to `/`

# game-setup Specification

## Purpose

Defines Modo 1 (Suporte Geral) player registration at `/game/setup`: adding/removing players, unique-name validation, ordering on the table, the minimum to start, and game initialization.

## Requirements

### Requirement: Player Registration

The system SHALL provide a text field and an "Adicionar" button to register players, list registered players with their table position (1, 2, 3…), and provide a "Remover" control per player.

#### Scenario: Adding a player
- **WHEN** the user enters a valid name and taps "Adicionar"
- **THEN** the player is appended to the list with the next table position and a "Remover" control

### Requirement: Unique Name Validation

The system SHALL block duplicate names (case-insensitive) and blank/whitespace-only names, showing an inline error and disabling "Adicionar" while the typed name is a duplicate or blank.

#### Scenario: Duplicate name blocked
- **WHEN** the typed name already exists in the list (ignoring case)
- **THEN** an inline error is shown and the "Adicionar" button is disabled

#### Scenario: Blank name blocked
- **WHEN** the typed name is empty or only whitespace
- **THEN** the name is rejected and "Adicionar" is disabled

### Requirement: Player Ordering

The system SHALL let the user reorder players (drag-and-drop or ↑/↓ controls); this order represents the real seating order at the table.

#### Scenario: Reordering players
- **WHEN** the user moves a player up or down in the setup list
- **THEN** the displayed order updates and represents the seating order used by the game

### Requirement: Minimum Players to Start

The system SHALL enable the "Começar" button only when at least 2 players are registered.

#### Scenario: Start disabled below two players
- **WHEN** fewer than 2 players are registered
- **THEN** the "Começar" button is disabled

### Requirement: Game Initialization

The system SHALL, on "Começar", initialize `GameState` with `phase: 'bid'`, `round: 1`, a randomly chosen `dealerIndex`, and navigate into the match.

#### Scenario: Starting the match
- **WHEN** the user taps "Começar" with at least 2 players
- **THEN** `GameState` is initialized at round 1 in the bid phase with a randomly selected dealer, and the match begins

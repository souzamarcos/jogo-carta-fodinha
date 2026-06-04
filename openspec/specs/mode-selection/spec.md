# mode-selection Specification

## Purpose

Defines the app entry screen (`/`) where the user chooses between Modo 1 (Suporte Geral) and Modo 2 (Painel Individual), including active-session indicators and continue/new flows, plus the mobile navigation shell for each mode. The two modes never navigate into each other's state.

## Requirements

### Requirement: Mode Selection Home Screen

The system SHALL present the route `/` as the only entry point, showing the game title and two large cards/buttons — one per mode. This screen has no bottom navigation bar.

#### Scenario: Home screen shows both modes
- **WHEN** the user opens the app at `/`
- **THEN** two mode options ("Suporte Geral" and "Painel Individual") are displayed as large selectable cards

### Requirement: Active Session Indicator

The system SHALL show an "Em andamento" badge on a mode's card when that mode has saved state — for Modo 1 the current round, and for Modo 2 the player name and current round.

#### Scenario: Modo 1 shows in-progress badge
- **WHEN** `gameStore` has an active match
- **THEN** the "Suporte Geral" card shows an "Em andamento" badge with the current round

#### Scenario: Modo 2 shows in-progress badge
- **WHEN** `playerHandStore` has an active session
- **THEN** the "Painel Individual" card shows an "Em andamento" badge with the player name and current round

### Requirement: Continue or New Session

The system SHALL, when a mode is tapped with an active session, prompt the user to continue or start a new session; when tapped without an active session, it navigates directly into that mode.

#### Scenario: Tapping a mode with an active session
- **WHEN** the user taps a mode card that has an active session
- **THEN** a modal offers "Continuar" and "Nova" options before navigating

#### Scenario: Tapping a mode without a session
- **WHEN** the user taps a mode card with no active session
- **THEN** the app navigates directly into that mode (Modo 1 → `/game/setup`, Modo 2 → `/player` setup)

### Requirement: Per-Mode Mobile Navigation

The system SHALL use a responsive mobile layout (`max-width: 480px` centered). Modo 1 shows a bottom navigation bar (Partida → `/game`, Trocar Modo → `/`) only during an active match (phases bid/playing). Modo 2 is a single-page interface with a "← Trocar Modo" control at the top. The two modes have no cross navigation.

#### Scenario: Modo 1 bottom navigation during a match
- **WHEN** a Modo 1 match is in the bid or playing phase
- **THEN** a bottom navigation bar with "Partida" and "Trocar Modo" is shown

#### Scenario: Switching mode returns to home
- **WHEN** the user activates "Trocar Modo" (Modo 1) or "← Trocar Modo" (Modo 2)
- **THEN** the app returns to `/` without entering the other mode's state

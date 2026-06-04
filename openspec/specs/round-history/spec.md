# round-history Specification

## Purpose

Defines the Modo 1 collapsible round-history table and the rule that every alive player's bid and tricks are recorded each round, so the history distinguishes a zero-bid alive player ("0/0") from an eliminated player ("–"). (Incorporates SPEC-024 / 006-fix-round-history-bids.)

## Requirements

### Requirement: Collapsible History Table

The system SHALL provide a collapsible "📋 Histórico de Rodadas" section (collapsed by default) whose table shows columns Rodada, Manilha, Cartas, and one column per player displaying `bid/tricks` with loss indicators.

#### Scenario: Expanding history
- **WHEN** the user expands the history section
- **THEN** a table is shown with Rodada, Manilha, Cartas, and per-player columns

### Requirement: Record All Alive Players' Bids and Tricks

The system SHALL store, when a round is confirmed, a `bids[playerId]` and `tricks[playerId]` entry for every player alive at round start, defaulting to 0 for players who never adjusted the input.

#### Scenario: Zero-bid player is recorded
- **WHEN** a round is confirmed and an alive player never changed their bid or tricks
- **THEN** `history[n].bids[playerId]` and `history[n].tricks[playerId]` both record 0 for that player

### Requirement: Distinguish Zero from Eliminated

The system SHALL display alive players as `bid/tricks` (e.g. "0/0", "1/1") and show "–" only for eliminated players, with loss indicators (e.g. " -1", " -3") matching the confirmation dialog and no indicator for 0 losses.

#### Scenario: Zero-bid alive player shows 0/0
- **WHEN** an alive player had zero bid and zero tricks in a round
- **THEN** the history cell shows "0/0" (not "–")

#### Scenario: Eliminated player shows dash
- **WHEN** a player was not alive at the start of a recorded round
- **THEN** that player's history cell shows "–"

#### Scenario: Loss indicator matches result
- **WHEN** a player lost lives in a round
- **THEN** the cell shows the loss indicator (e.g. " -1") matching the "Confirmar Resultado" values, and shows none when 0 lives were lost

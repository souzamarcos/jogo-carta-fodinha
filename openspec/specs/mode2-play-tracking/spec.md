# mode2-play-tracking Specification

## Purpose

Defines the Modo 2 (Painel Individual) play screen: tracking other players' played cards (Bloco A), the user's own hand (Bloco B), the derived table-cards counter, the card-strength analysis, the per-cycle structure that mirrors one card per player per turn, and round finalization without history. (Incorporates the base spec plus SPEC-027 cycles.)

## Requirements

### Requirement: Bloco A — Other Players' Cards

The system SHALL provide a two-section value grid to register cards played by others: a top row of 9 non-manilha values each with an availability badge plus a "?" button, and a bottom manilha row exposing the 4 suits directly each with badge 0 or 1. Tapping a value registers it immediately; tapping a manilha suit registers `{ value: manilha.value, suit }`; tapping "?" registers `{ value: 'unknown' }`. Registered cards are listed below with an "×" to remove each.

#### Scenario: Registering a non-manilha card
- **WHEN** the user taps a non-manilha value in Bloco A
- **THEN** that card is registered immediately and added to the list

#### Scenario: Registering an unknown card
- **WHEN** the user taps "?"
- **THEN** a `{ value: 'unknown' }` card is registered without blocking the flow and without affecting availability badges

#### Scenario: Removing a registered card
- **WHEN** the user taps "×" on a listed card
- **THEN** the card is removed and the table counter increments back

### Requirement: Availability Badges

The system SHALL compute each Bloco A and hand-grid badge as `possível(V) = 4 − handCards with value V − known otherPlayedCards with value V`; for the manilha each suit badge is `1 − (in hand) − (already played)`. A badge of 0 greys the button (still tappable in Bloco A). Unknown cards do not affect the calculation.

#### Scenario: Badge reflects remaining copies
- **WHEN** the user holds one `7` and one `7` was played by others
- **THEN** the `7` badge in Bloco A reads `2` (`4 − 1 − 1`)

#### Scenario: Zero badge greyed but tappable in Bloco A
- **WHEN** a value's availability reaches 0
- **THEN** its Bloco A button is greyed but still tappable

### Requirement: Bloco B — My Hand

The system SHALL show the user's `handCards` as tappable cards: tapping a not-played card marks it `played = true` (struck/greyed); tapping a played card toggles it back to `played = false` (always allowed). Duplicate common values are shown identically; tapping marks the first non-played instance.

#### Scenario: Marking own card played
- **WHEN** the user taps a not-played hand card (and the cycle/table limit is not reached)
- **THEN** that card is marked `played = true`

#### Scenario: Toggling own card back
- **WHEN** the user taps a played hand card
- **THEN** it is toggled back to `played = false`, even when the table limit is reached

### Requirement: Table Cards Counter

The system SHALL display a derived counter `(numPlayers × cardsPerPlayer) − played hand cards − otherPlayedCards`, shown as "X restantes de Y" with a progress bar, updated automatically. When the total played reaches `numPlayers × cardsPerPlayer`, Bloco A (including "?") is disabled and Bloco B disallows new plays (undo still allowed).

#### Scenario: Counter updates on each mark
- **WHEN** a card is registered in Bloco A or marked played in Bloco B
- **THEN** the "X restantes de Y" counter and progress bar update immediately

#### Scenario: Grid disabled at the table limit
- **WHEN** total played reaches `numPlayers × cardsPerPlayer`
- **THEN** Bloco A (including "?") is disabled and Bloco B blocks new plays while still allowing undo

### Requirement: Card-Strength Analysis

The system SHALL show the user's not-played hand cards ranked strongest to weakest, computed only among the user's remaining cards (Bloco A does not influence ranking), with positional labels ("1ª mais forte", etc.) and a ⭐ + suit marker for the manilha; it shows guidance when no manilha is set or all cards are played.

#### Scenario: Ranking among own cards
- **WHEN** the user has remaining not-played cards and a manilha is set
- **THEN** those cards are listed strongest-to-weakest with positional labels, ranked only among themselves

#### Scenario: Guidance when manilha missing
- **WHEN** no manilha is set
- **THEN** the analysis shows "Informe a manilha para ver a análise"

### Requirement: Per-Cycle Play Structure

The system SHALL show a cycle indicator on the play screen reading `cardsPlayedInCycle / numPlayers` with the current cycle number (starting at 1), cap the combined own+other cards per cycle at `numPlayers`, allow at most one own card played per cycle, and require an explicit advance to open the next cycle. `currentCycle` and `cardsPlayedInCycle` reset each round and are persisted across reload.

#### Scenario: Cycle counts up to the cap
- **WHEN** `numPlayers = 4` and the user plays one own card then registers three other-player cards in the cycle
- **THEN** the counter goes 1/4 → 2/4 → 3/4 → 4/4 and the "add other card" control is disabled at 4/4

#### Scenario: One own card per cycle
- **WHEN** the user has already marked one own card played in the current cycle
- **THEN** marking a second own card in the same cycle is blocked until the next cycle

#### Scenario: Toggling own card frees the cycle slot
- **WHEN** the user un-marks the own card played in the current cycle
- **THEN** the per-cycle counter decrements by 1 and the user may mark a different own card in the same cycle

#### Scenario: Advancing to the next cycle
- **WHEN** at least one card has been played and the user taps the advance control ("Próximo Ciclo")
- **THEN** the cycle number increments and the per-cycle counter resets to `0 / numPlayers`, with previously played cards still recorded

#### Scenario: Previous-cycle undo when current is empty
- **WHEN** the current cycle has 0 recorded cards
- **THEN** a previous-cycle control is available to step back to the prior cycle and its last count

#### Scenario: Round complete state without auto-finalize
- **WHEN** the user has played all own hand cards across cycles
- **THEN** the indicator shows a "round complete" state and the round is not auto-finalized — the user still triggers finish explicitly

#### Scenario: Cycle cap follows numPlayers and persists
- **WHEN** `numPlayers` is 3 when the play screen loads and the app is reloaded mid-round
- **THEN** the cap is 3 for every cycle and the restored state shows the exact cycle number and per-cycle count

### Requirement: Finalize Round Without History

The system SHALL provide a "Finalizar Rodada" action available at any time during play (no confirmation), which increments `round`, clears `handCards`, `otherPlayedCards`, and `manilha`, recalculates `cardsPerPlayer`, returns to setup, and keeps only `round`, `numPlayers`, and `playerName` — Modo 2 stores no round history.

#### Scenario: Finalizing a round
- **WHEN** the user taps "Finalizar Rodada"
- **THEN** `round` increments, the hand/other-cards/manilha are cleared, `cardsPerPlayer` is recalculated, and the user returns to setup with only `round`, `numPlayers`, and `playerName` preserved

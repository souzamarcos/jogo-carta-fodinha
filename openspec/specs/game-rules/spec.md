# game-rules Specification

## Purpose

Defines the Fodinha card-game domain rules the app relies on: the deck, card strength hierarchy, manilha determination, cards-per-round, trick resolution, lives/scoring, elimination and victory conditions. These rules are the shared source of truth for both modes and for any UI that displays or computes game state.

## Requirements

### Requirement: Deck Composition

The system SHALL model a 40-card deck of 4 suits × 10 values. Suits are Ouros (♦), Espadas (♠), Copas (♥), Paus (♣). Values are `4, 5, 6, 7, Q, J, K, A, 2, 3` (no 8, 9, 10).

#### Scenario: Enumerating the deck
- **WHEN** the deck model is referenced
- **THEN** it contains exactly 40 distinct cards (10 values × 4 suits) and no value `8`, `9`, or `10`

### Requirement: Card Strength Hierarchy

The system SHALL rank non-manilha card values from weakest to strongest as `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`.

#### Scenario: Comparing two non-manilha cards
- **WHEN** two non-manilha cards of different values are compared
- **THEN** the card whose value is higher in the order `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3` is the stronger card

#### Scenario: Two equal non-manilha cards tie ("melou")
- **WHEN** two non-manilha cards of equal value contest a trick
- **THEN** neither card wins the trick ("melou"), and the trick is resolved as a tie

### Requirement: Manilha Determination

The system SHALL treat the manilha as the value immediately above the turned "vira" in the strength order, wrapping `3 → 4`. The manilha is the strongest card of the round, and for the manilha the suit matters.

#### Scenario: Vira determines manilha value
- **WHEN** the vira value is `7`
- **THEN** the manilha value for that round is `Q`

#### Scenario: Vira wraps from 3 to 4
- **WHEN** the vira value is `3`
- **THEN** the manilha value for that round is `4`

### Requirement: Manilha Suit Tie-Break

The system SHALL break ties between two manilha cards by suit, ordered weakest to strongest as `♣ Paus < ♥ Copas < ♠ Espadas < ♦ Ouros`. No two manilhas can tie.

#### Scenario: Manilha beats any non-manilha
- **WHEN** a manilha card contests a trick against any non-manilha card
- **THEN** the manilha wins the trick

#### Scenario: Suit breaks a manilha tie
- **WHEN** two manilha cards contest a trick
- **THEN** the manilha of the stronger suit (`♦ Ouros` strongest, `♣ Paus` weakest) wins, with no possibility of a tie

### Requirement: Cards Per Round

The system SHALL deal `N` cards per player on round `N`, capped at `floor(40 / number_of_alive_players)`. Once the cap is reached, cards per player stays fixed at that value for the rest of the game.

#### Scenario: Round number sets the hand size
- **WHEN** the game is on round 3 and the cap is not yet reached
- **THEN** each player receives 3 cards

#### Scenario: Cap holds at the maximum
- **WHEN** the round number would require more cards than `floor(40 / alivePlayers)`
- **THEN** cards per player stays fixed at `floor(40 / alivePlayers)` and does not decrease

### Requirement: Trick Resolution

The system SHALL resolve each trick (vaza) so that the strongest card wins, following the manilha and value/suit rules; the trick winner starts the next trick, and on a "melou" tie the same player who started the trick starts the next.

#### Scenario: Strongest card takes the trick
- **WHEN** all players have played one card in a trick and exactly one card is strongest
- **THEN** the owner of that card wins the trick and leads the next trick

### Requirement: Lives and Scoring

The system SHALL start each player with 5 lives and deduct `|bid − tricks_won|` lives at the end of each round; a correct bid loses no lives.

#### Scenario: Correct bid loses no lives
- **WHEN** a player's bid equals the tricks they won
- **THEN** that player loses 0 lives

#### Scenario: Wrong bid loses the absolute difference
- **WHEN** a player bid 2 and won 0 tricks
- **THEN** that player loses 2 lives (`|2 − 0|`)

### Requirement: Elimination and Victory

The system SHALL mark a player eliminated (`alive = false`) when their lives reach 0 or below, exclude eliminated players from later rounds, and declare the last alive player the winner.

#### Scenario: Reaching zero lives eliminates a player
- **WHEN** a player's lives reach 0 or below after a round
- **THEN** the player is marked `alive = false` and does not participate in subsequent rounds

#### Scenario: Last player standing wins
- **WHEN** exactly one player remains alive
- **THEN** the game ends and that player is the winner

### Requirement: Sudden Death on Simultaneous Elimination

The system SHALL trigger sudden death when two or more players reach 0 lives in the same round: the tied players play extra rounds among themselves (starting at 1 card), and after each extra round the player who loses more lives is eliminated; an equal loss triggers another extra round automatically.

#### Scenario: Simultaneous eliminations enter sudden death
- **WHEN** two or more players reach 0 lives in the same round
- **THEN** sudden death begins among the tied players, using the normal round flow starting at 1 card

#### Scenario: Repeated tie restarts an extra round
- **WHEN** an extra round ends with the tied players losing an equal number of lives
- **THEN** a new extra round starts automatically without asking the user again

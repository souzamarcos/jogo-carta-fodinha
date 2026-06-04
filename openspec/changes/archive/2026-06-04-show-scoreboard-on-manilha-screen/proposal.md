## Why

In Modo 1 (Suporte Geral), the manilha-selection sub-phase that opens every round currently hides the lives panel (placar), so players cannot see who is still in and how many lives each has at the exact moment they decide the manilha and prepare their bids. Showing the scoreboard on this screen keeps the game context visible during a key decision point.

## What Changes

- On the Modo 1 round screen (`/game/round`), during the manilha-selection sub-phase (`bidSubPhase === 'manilha'`), the lives panel (placar) listing every player with their remaining lives SHALL be visible, using the same seating order and color-coding already used in the bid/playing phases.
- No change to manilha selection behavior itself, to scoring, or to any other phase.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `round-flow`: The "Manilha Selection in Bid Phase" requirement is clarified so the lives panel remains visible while the manilha is being chosen (it is not hidden along with the bid inputs).

## Impact

- Affected code: `src/pages/GameRoundPage.tsx` (the `BidPhase` rendering, `bidSubPhase === 'manilha'` branch) — render the existing player/lives panel below the manilha selector (selector first, placar underneath).
- Reuses existing `PlayerCard` / `LivesIndicator` components and `gameStore` state (`players`, `lives`, `alive`); no store or data-model changes.
- No API, dependency, or persistence changes.

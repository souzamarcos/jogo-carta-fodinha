## Context

Modo 1's round screen (`src/pages/GameRoundPage.tsx`, route `/game/round`) renders the bid phase through a `BidPhase` function driven by `currentRound.bidSubPhase` (`'manilha'` → `'dealer'`/`'bids'`). Today the per-player lives panel (the list of `PlayerCard` + `LivesIndicator` components, fed by `gameStore.players`) is only rendered once the flow reaches the bids sub-phase and the playing phase. During `bidSubPhase === 'manilha'` only the manilha value/suit selector is shown, so the placar is hidden at the moment the user opens the round.

This is a presentation-only adjustment: the data (players, lives, alive) is already in the store and already rendered elsewhere with the exact color-coding rules defined by the `round-flow` "Lives Panel" requirement.

## Goals / Non-Goals

**Goals:**
- Make the existing lives panel visible during the manilha-selection sub-phase, reusing the current component and color-coding.
- Keep the manilha selector unchanged in behavior and position.

**Non-Goals:**
- No change to manilha selection logic, bid entry, scoring, or any other phase.
- No change to `gameStore`, persisted state, or the data model.
- No new component or styling system; reuse `PlayerCard` / `LivesIndicator`.

## Decisions

- **Render the lives panel in the `bidSubPhase === 'manilha'` branch by reusing the same player-list markup already used in the bids sub-phase**, rather than building a manilha-specific variant. Rationale: guarantees identical seating order and color-coding, avoids divergence, minimal diff. Alternative considered: a separate compact scoreboard component — rejected as unnecessary duplication for a visibility-only change.
- **Show the panel in read-only form** (no bid/trick inputs) during manilha selection, since bids are intentionally hidden until a manilha value is chosen (existing "Bids hidden before manilha" scenario). The panel passes no input children in this branch.

## Risks / Trade-offs

- [Vertical space on small screens: the panel could push the manilha grid down] → Render the manilha selector first and the placar panel below it, so the primary action (choosing the manilha) stays at the top of the screen and the placar is reachable by scroll.
- [Regression risk in the shared bid-phase rendering] → Change is additive to the `'manilha'` branch only; the existing "Bids hidden before manilha" behavior is preserved (no inputs rendered).

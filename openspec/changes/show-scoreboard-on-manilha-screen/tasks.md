## 1. Implementation

- [x] 1.1 In `src/pages/GameRoundPage.tsx`, locate the `BidPhase` rendering and the `bidSubPhase === 'manilha'` branch
- [x] 1.2 Render the existing lives panel (the `PlayerCard` + `LivesIndicator` list over players, in seating order) below the manilha selector in the `'manilha'` branch, reusing the same markup/order/color-coding as the bids sub-phase
- [x] 1.3 Render the panel read-only in this branch (pass no bid/trick input children) so the palpite inputs stay hidden until a manilha value is selected

## 2. Verification

- [x] 2.1 Manually verify: opening a round in Modo 1 shows the placar with every player and their lives during manilha selection, with eliminated players greyed/struck and correct color-coding
- [x] 2.2 Confirm the manilha selector still works and bid inputs remain hidden until a manilha value is chosen
- [x] 2.3 Run `openspec validate show-scoreboard-on-manilha-screen --strict`

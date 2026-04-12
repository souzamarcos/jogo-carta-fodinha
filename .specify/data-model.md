# Data Model — Fodinha PWA

> Derived from `spec.md`. All types are TypeScript-first; runtime validation is responsibility of store actions.

---

## Shared Primitives

```ts
type CardValue = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3';
type CardSuit  = 'ouros' | 'espadas' | 'copas' | 'paus';

// Card strength order index (0 = weakest, 9 = strongest among non-manilha)
const CARD_ORDER: CardValue[] = ['4','5','6','7','Q','J','K','A','2','3'];

// Suit strength order index (0 = weakest manilha, 3 = strongest manilha)
const SUIT_ORDER: CardSuit[] = ['paus','copas','espadas','ouros'];

interface Card {
  value: CardValue;
  suit?: CardSuit; // required only when card is the manilha
}
```

### Validation rules
- `suit` is required when `card.value === currentManilha.value`
- `suit` is ignored (and should be omitted) for non-manilha cards

---

## Mode 1 — GameState

### Primary aggregate

```ts
interface GameState {
  players:      Player[];         // ordered by table position (position field is redundant but explicit)
  round:        number;           // starts at 1, increments each round
  dealerIndex:  number;           // index into alivePlayers() subset
  phase:        GamePhase;
  currentRound: RoundState | null;
  history:      RoundHistory[];   // append-only log of completed rounds
  startedAt:    string;           // ISO 8601 timestamp
  finishedAt?:  string;           // ISO 8601 timestamp, set on phase = 'finished'
}
```

### GamePhase state machine

```
setup ──► bid ──► playing ──► result ──► bid (loop)
                                      └──► tiebreak ──► bid (tiebreak loop)
                                      └──► finished
```

```ts
type GamePhase =
  | 'setup'      // player registration
  | 'bid'        // manilha selection + bids entry
  | 'playing'    // round in progress, timer running
  | 'result'     // tricks entry + confirmation modal
  | 'tiebreak'   // sudden-death: modal offers "Declare Tie" or "Extra Round"
  | 'finished';  // game over, winner declared
```

### Player

```ts
interface Player {
  id:       string;  // uuid v4, immutable
  name:     string;  // unique case-insensitive within game
  position: number;  // 0-based table order, immutable after setup
  lives:    number;  // starts at 5; >= 0 always (clamped at 0 before alive check)
  alive:    boolean; // false when lives <= 0
}
```

#### Validation rules
- `name` trimmed, non-empty, unique case-insensitive among players
- `position` must be a contiguous 0-based sequence
- `lives` minimum stored value: 0 (never negative in state)

### RoundState

```ts
interface RoundState {
  manilha:         Card;                    // value + suit required
  cardsPerPlayer:  number;                  // min(round, floor(40 / alivePlayers.length))
  bids:            Record<string, number>;  // playerId → bid (0..cardsPerPlayer)
  tricks:          Record<string, number>;  // playerId → tricks won (phase: result)
  startedAt:       string;                  // ISO timestamp (timer baseline)
  firstBidderIndex: number;                 // index in alivePlayers() who bids first
}
```

### RoundHistory

```ts
interface RoundHistory {
  round:          number;
  manilha:        Card;
  cardsPerPlayer: number;
  bids:           Record<string, number>;
  tricks:         Record<string, number>;
  losses:         Record<string, number>;  // playerId → |bid - tricks|
}
```

#### Derived helpers (not stored)

```ts
// Ordered alive players for current round
function alivePlayers(state: GameState): Player[]
  => state.players.filter(p => p.alive).sort((a,b) => a.position - b.position)

// Cards per player for a given round and alive count
function calcCardsPerPlayer(round: number, aliveCount: number): number
  => Math.min(round, Math.floor(40 / aliveCount))

// Lives lost in a round for one player
function calcLoss(bid: number, tricks: number): number
  => Math.abs(bid - tricks)
```

---

## Mode 2 — PlayerHandState

### Primary aggregate

```ts
interface PlayerHandState {
  playerName:       string;             // free text, non-empty
  numPlayers:       number;             // ≥ 2 (total players at table, including self)
  round:            number;             // starts at 1, user-incremented
  cardsPerPlayer:   number;             // min(round, floor(40/numPlayers)); manual override allowed
  manilha:          Card | null;        // null during setup Etapa 1
  handCards:        HandCard[];         // set during setup Etapa 2, max = cardsPerPlayer
  otherPlayedCards: OtherPlayedCard[];  // set during play via Block A
}

interface HandCard {
  value:  CardValue;
  suit?:  CardSuit;   // required if value === manilha.value
  played: boolean;    // toggled via Block B
}

interface OtherPlayedCard {
  value: CardValue | 'unknown';  // 'unknown' = player didn't see/remember
  suit?: CardSuit;               // required if value === manilha.value (and not 'unknown')
}
```

### Derived helpers (not stored)

```ts
// Total cards on table still in play
function cardsOnTable(state: PlayerHandState): number
  => (state.numPlayers * state.cardsPerPlayer)
     - state.handCards.filter(c => c.played).length
     - state.otherPlayedCards.length

// Remaining copies of a non-manilha value that may be in other hands
function countRemainingNonManilha(
  value: CardValue,
  handCards: HandCard[],
  otherPlayed: OtherPlayedCard[]
): number
  => 4
     - handCards.filter(c => c.value === value).length
     - otherPlayed.filter(c => c.value === value && c.value !== 'unknown').length

// Remaining copies of a specific manilha suit in other hands
function countRemainingManilhaSuit(
  suit: CardSuit,
  manilhaValue: CardValue,
  handCards: HandCard[],
  otherPlayed: OtherPlayedCard[]
): 0 | 1
  => Math.max(0,
       1
       - (handCards.some(c => c.value === manilhaValue && c.suit === suit) ? 1 : 0)
       - (otherPlayed.filter(c => c.value === manilhaValue && c.suit === suit).length)
     ) as 0 | 1

// Sorted remaining hand cards (strongest first), considering manilha
function sortedRemainingHand(handCards: HandCard[], manilha: Card): HandCard[]
  // manilha cards sort above all; among manilhas sort by SUIT_ORDER desc;
  // among non-manilha sort by CARD_ORDER desc
```

### State lifecycle

| Event | Reset fields | Persist fields |
|---|---|---|
| "Finalizar Rodada" | `handCards`, `otherPlayedCards`, `manilha` | `playerName`, `numPlayers`, `round` (incremented), `cardsPerPlayer` (recalculated) |
| "Nova Sessão" | All fields | — |
| App restart | — (full rehydration from localStorage) | All |

---

## localStorage Keys

| Key | Store | Notes |
|---|---|---|
| `fodinha-game` | `gameStore` (GameState) | Zustand persist key |
| `fodinha-hand` | `playerHandStore` (PlayerHandState) | Zustand persist key |

Both stores are independent. No cross-store reads or writes.

---

## Entity Relationship Summary

```
GameState
  ├── Player[]          (1..n, min 2)
  ├── RoundState?       (0..1, current round)
  └── RoundHistory[]    (0..n, completed rounds)

PlayerHandState         (fully independent from GameState)
  ├── HandCard[]        (0..cardsPerPlayer)
  └── OtherPlayedCard[] (0..numPlayers×cardsPerPlayer)
```

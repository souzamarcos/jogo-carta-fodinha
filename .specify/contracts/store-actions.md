# Store Action Contracts — Fodinha PWA

> Defines the public action interface for each Zustand store. Implementations must satisfy these signatures. All actions are synchronous (no async needed — localStorage only).

---

## gameStore Actions

```ts
interface GameStoreActions {
  // ── Setup ──────────────────────────────────────────────────────────────
  
  /** Initialize a new game with ordered players. Clears all previous state. */
  startGame(players: { name: string }[]): void;
  // Preconditions: players.length >= 2; names unique case-insensitive; names non-empty
  // Effect: creates Player[] with uuid ids, position 0..n-1, lives=5, alive=true
  //         sets round=1, dealerIndex=0 (first player in registration order), phase='bid', history=[]
  //         currentRound.bidSubPhase = 'manilha'

  /** Reset game with same players (Revanche). */
  rematch(): void;
  // Preconditions: phase === 'finished'
  // Effect: resets lives=5, alive=true for all; round=1; dealerIndex=random; phase='bid'; history=[]

  /** Clear all game state (start fresh). */
  resetGame(): void;

  // ── Bid Phase ──────────────────────────────────────────────────────────

  /** Set the manilha for the current round. Transitions bidSubPhase to 'dealer'. */
  setManilha(card: Card): void;
  // Preconditions: phase === 'bid'; card.suit required
  // Effect: currentRound.manilha = card; currentRound.bidSubPhase = 'dealer'

  /**
   * Confirm (and optionally override) the dealer for the current round.
   * Transitions bidSubPhase from 'dealer' to 'bids', making palpite inputs visible.
   * Available in all rounds; edit UI is shown only from round 2 onwards (per FR-007).
   */
  confirmDealer(overrideDealerIndex?: number): void;
  // Preconditions: phase === 'bid'; currentRound.bidSubPhase === 'dealer'
  // Effect:
  //   if overrideDealerIndex provided → gameState.dealerIndex = overrideDealerIndex
  //   currentRound.firstBidderIndex = (dealerIndex + 1) % alivePlayers().length
  //   currentRound.bidSubPhase = 'bids'

  /** Record a player's bid. */
  setBid(playerId: string, bid: number): void;
  // Preconditions: phase === 'bid'; bid >= 0 && bid <= currentRound.cardsPerPlayer
  // Effect: updates currentRound.bids[playerId]

  // ── Playing Phase ──────────────────────────────────────────────────────

  /** Transition from bid to playing. Starts timer (records startedAt). */
  startRound(): void;
  // Preconditions: phase === 'bid'; manilha set; all alive players have bids
  // Effect: phase = 'playing'; currentRound.startedAt = now()

  // ── Result Phase ───────────────────────────────────────────────────────

  /** Transition from playing to result entry. */
  endRound(): void;
  // Preconditions: phase === 'playing'
  // Effect: phase = 'result'

  /** Record tricks won by a player. */
  setTricks(playerId: string, tricks: number): void;
  // Preconditions: phase === 'result'; tricks >= 0 && tricks <= currentRound.cardsPerPlayer

  /** Confirm round results: apply losses, advance round or end game. */
  confirmResult(): void;
  // Preconditions: phase === 'result'; all alive players have tricks recorded
  // Effect:
  //   1. Calculate loss = |bid - tricks| per player
  //   2. Deduct lives; clamp at 0; set alive=false if lives <= 0
  //   3. Append RoundHistory
  //   4. If simultaneous eliminations → phase = 'tiebreak'
  //      Else if one alive → phase = 'finished'; finishedAt = now()
  //      Else → round++; advance dealerIndex (circular, skipping dead players)
  //             reset currentRound with bidSubPhase = 'manilha'; phase = 'bid'

  // ── Tiebreak Phase ─────────────────────────────────────────────────────

  /** Declare a tie — all simultaneously eliminated players are co-winners. */
  declareTie(): void;
  // Preconditions: phase === 'tiebreak'
  // Effect: phase = 'finished'; finishedAt = now()

  /** Start an extra tiebreak round among tied players. */
  startTiebreakRound(): void;
  // Preconditions: phase === 'tiebreak'
  // Effect: round++; cardsPerPlayer restarts at 1 for tiebreak participants; phase = 'bid'
  //         currentRound.bidSubPhase = 'manilha'
  //         (tiebreak participants = players with lives <= 0 from last confirmResult)
}
```

---

## playerHandStore Actions

```ts
interface PlayerHandStoreActions {
  // ── Session ────────────────────────────────────────────────────────────

  /** Initialize a new Mode 2 session. Clears all previous state. */
  initSession(playerName: string, numPlayers: number): void;
  // Preconditions: playerName non-empty; numPlayers >= 2
  // Effect: round=1, cardsPerPlayer=1, manilha=null, handCards=[], otherPlayedCards=[]

  /** Reset session (new game, same or different player). */
  resetSession(): void;

  // ── Round Setup ────────────────────────────────────────────────────────

  /** Set the manilha for the current round (completes Etapa 1). */
  setManilha(card: Card): void;
  // Preconditions: card.value and card.suit both set

  /** Add a card to the player's hand (Etapa 2). */
  addHandCard(value: CardValue, suit?: CardSuit): void;
  // Preconditions: handCards.length < cardsPerPlayer
  //               if value === manilha.value → suit required
  //               for non-manilha: suit ignored/omitted
  // Effect: appends HandCard with played=false

  /** Remove a hand card by index. */
  removeHandCard(index: number): void;

  /** Override cardsPerPlayer manually for current round. */
  setCardsPerPlayer(n: number): void;
  // Preconditions: n >= 1 && n <= floor(40 / numPlayers)

  // ── Round Play ─────────────────────────────────────────────────────────

  /** Toggle a hand card's played status (Block B). */
  toggleHandCardPlayed(index: number): void;
  // Preconditions (to mark played): total played < numPlayers × cardsPerPlayer
  // Unmarking (played → false) is always allowed

  /** Register a card played by another player (Block A). */
  addOtherPlayedCard(value: CardValue | 'unknown', suit?: CardSuit): void;
  // Preconditions: total played < numPlayers × cardsPerPlayer
  //               if value === manilha.value → suit required

  /** Remove an entry from other played cards (Block A ×). */
  removeOtherPlayedCard(index: number): void;

  // ── Round End ──────────────────────────────────────────────────────────

  /** Advance to next round. Can be called at any time (no validation). */
  finishRound(): void;
  // Effect: round++; recalculate cardsPerPlayer = min(round, floor(40/numPlayers))
  //         clear handCards, otherPlayedCards, manilha
  //         preserve playerName, numPlayers
}
```

---

## cardUtils Public API

```ts
// Compare two non-manilha cards. Returns positive if a > b, negative if a < b, 0 if equal.
function compareCards(a: CardValue, b: CardValue): number

// Returns true if card is the manilha for this round.
function isManilha(card: Card, manilha: Card): boolean

// Compare two manilha cards by suit strength. Returns positive if a > b.
function compareManilhaSuits(a: CardSuit, b: CardSuit): number

// Sort hand cards strongest-first. Manilha cards always sort above non-manilha.
// Among manilha cards: sorted by suit strength descending.
// Among non-manilha: sorted by card value descending.
function sortHandStrongest(cards: HandCard[], manilha: Card | null): HandCard[]

// Count remaining copies of a non-manilha value in other players' hands.
function countRemainingNonManilha(
  value: CardValue,
  handCards: HandCard[],
  otherPlayed: OtherPlayedCard[]
): number  // 0..4

// Count remaining copies of a specific manilha suit in other players' hands.
function countRemainingManilhaSuit(
  suit: CardSuit,
  manilhaValue: CardValue,
  handCards: HandCard[],
  otherPlayed: OtherPlayedCard[]
): 0 | 1
```

---

## UI Component Props Contracts

### CardGrid (shared by Block A, Block B setup, and Etapa 2)

```ts
interface CardGridProps {
  manilha: Card | null;
  handCards: HandCard[];           // for availability calculation
  otherPlayed: OtherPlayedCard[];  // for availability calculation (empty during setup)
  onCardSelect: (value: CardValue) => void;
  onManilhaSuitSelect: (suit: CardSuit) => void;
  disabled?: boolean;              // true when total limit reached
  disableAtZero?: boolean;         // true in setup (badge 0 = disabled); false in Block A (tocável)
}
```

### PlayerCard (updated — SPEC-020)

```ts
interface PlayerCardProps {
  player: Player;
  isDealer?: boolean;         // true when this player is the current round dealer
  isFirstBidder?: boolean;    // true when this player bids first this round
  isCurrentBidder?: boolean;  // true when this player is next to enter a bid (highlight)
  children?: React.ReactNode; // BidInput slot
}
// Renders a persistent label "Distribui" when isDealer=true
// Renders a persistent label "Primeiro palpite" when isFirstBidder=true
// Both labels are visible simultaneously when the player is both dealer and first bidder (edge case: single alive player)
```

### LivesIndicator

```ts
interface LivesIndicatorProps {
  lives: number;
  // Derived color: lives > 3 → green | lives === 3 → yellow | lives <= 2 → red
}
```

### ConfirmResultModal

```ts
interface ConfirmResultModalProps {
  players: Player[];
  bids: Record<string, number>;
  tricks: Record<string, number>;
  onConfirm: () => void;
  onBack: () => void;
}
// Displays: Jogador | Palpite | Fez | Diferença | Vidas perdidas
```

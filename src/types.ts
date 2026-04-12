export type CardValue = '4' | '5' | '6' | '7' | 'Q' | 'J' | 'K' | 'A' | '2' | '3';
export type CardSuit = 'ouros' | 'espadas' | 'copas' | 'paus';

export const CARD_ORDER: readonly CardValue[] = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
export const SUIT_ORDER: readonly CardSuit[] = ['paus', 'copas', 'espadas', 'ouros'];

export interface Card {
  value: CardValue;
  suit?: CardSuit;
}

export type GamePhase = 'setup' | 'bid' | 'playing' | 'result' | 'tiebreak' | 'finished';

export interface Player {
  id: string;
  name: string;
  position: number;
  lives: number;
  alive: boolean;
}

export interface RoundState {
  manilha: Card | null;
  cardsPerPlayer: number;
  bids: Record<string, number>;
  tricks: Record<string, number>;
  startedAt: string;
  firstBidderIndex: number;
}

export interface RoundHistory {
  round: number;
  manilha: Card;
  cardsPerPlayer: number;
  bids: Record<string, number>;
  tricks: Record<string, number>;
  losses: Record<string, number>;
}

export interface GameState {
  players: Player[];
  round: number;
  dealerIndex: number;
  phase: GamePhase;
  currentRound: RoundState | null;
  history: RoundHistory[];
  startedAt: string;
  finishedAt?: string;
}

export interface HandCard {
  value: CardValue;
  suit?: CardSuit;
  played: boolean;
}

export interface OtherPlayedCard {
  value: CardValue | 'unknown';
  suit?: CardSuit;
}

export interface PlayerHandState {
  playerName: string;
  numPlayers: number;
  round: number;
  cardsPerPlayer: number;
  manilha: Card | null;
  handCards: HandCard[];
  otherPlayedCards: OtherPlayedCard[];
}

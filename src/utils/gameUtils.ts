import type { GameState, Player, PlayerHandState } from '@/types';

/** Get alive players sorted by position. */
export function alivePlayers(state: GameState): Player[] {
  return state.players.filter(p => p.alive).sort((a, b) => a.position - b.position);
}

/** Cards per player for a given round and alive count. */
export function calcCardsPerPlayer(round: number, aliveCount: number): number {
  if (aliveCount <= 0) return 1;
  return Math.min(round, Math.floor(40 / aliveCount));
}

/** Lives lost in a round for one player. */
export function calcLoss(bid: number, tricks: number): number {
  return Math.abs(bid - tricks);
}

/** Index (in alivePlayers array) of the first bidder, given the dealer index. */
export function getFirstBidderIndex(dealerIndex: number, alive: Player[]): number {
  if (alive.length === 0) return 0;
  return (dealerIndex + 1) % alive.length;
}

/** Advance dealer index among alive players. */
export function nextDealerIndex(current: number, alive: Player[]): number {
  if (alive.length === 0) return 0;
  return (current + 1) % alive.length;
}

/** Player id of the current round's dealer (index into alivePlayers). */
export function getDealerId(state: GameState): string | null {
  const alive = alivePlayers(state);
  return alive[state.dealerIndex]?.id ?? null;
}

/** Player id of the first bidder (alive player immediately after dealer). */
export function getFirstBidderId(state: GameState): string | null {
  const alive = alivePlayers(state);
  if (alive.length === 0) return null;
  const idx = (state.dealerIndex + 1) % alive.length;
  return alive[idx]?.id ?? null;
}

/** Derived: cards still in play on the table. */
export function cardsOnTable(state: PlayerHandState): number {
  const played = state.handCards.filter(c => c.played).length + state.otherPlayedCards.length;
  return Math.max(0, state.numPlayers * state.cardsPerPlayer - played);
}

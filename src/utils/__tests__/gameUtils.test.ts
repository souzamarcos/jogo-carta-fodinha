import { describe, it, expect } from 'vitest';
import {
  calcCardsPerPlayer,
  calcLoss,
  alivePlayers,
  cardsOnTable,
  getFirstBidderIndex,
  nextDealerIndex,
} from '../gameUtils';
import type { GameState, Player, PlayerHandState } from '@/types';

describe('calcCardsPerPlayer', () => {
  it('round=1, alive=4 → 1', () => expect(calcCardsPerPlayer(1, 4)).toBe(1));
  it('round=5, alive=4 → 5', () => expect(calcCardsPerPlayer(5, 4)).toBe(5));
  it('round=10, alive=4 → 10', () => expect(calcCardsPerPlayer(10, 4)).toBe(10));
  it('round=11, alive=4 → 10 (cap at floor(40/4)=10)', () => expect(calcCardsPerPlayer(11, 4)).toBe(10));
  it('round=1, alive=3 → 1', () => expect(calcCardsPerPlayer(1, 3)).toBe(1));
  it('round=14, alive=3 → 13 (floor(40/3)=13)', () => expect(calcCardsPerPlayer(14, 3)).toBe(13));
  it('round=5, alive=2 → 5 (floor(40/2)=20)', () => expect(calcCardsPerPlayer(5, 2)).toBe(5));
  it('round=20, alive=2 → 20', () => expect(calcCardsPerPlayer(20, 2)).toBe(20));
  it('round=21, alive=2 → 20 (cap)', () => expect(calcCardsPerPlayer(21, 2)).toBe(20));
  it('alive=0 returns 1 (guard)', () => expect(calcCardsPerPlayer(5, 0)).toBe(1));
});

describe('calcLoss', () => {
  it('bid=2, tricks=0 → 2', () => expect(calcLoss(2, 0)).toBe(2));
  it('bid=2, tricks=2 → 0', () => expect(calcLoss(2, 2)).toBe(0));
  it('bid=0, tricks=3 → 3', () => expect(calcLoss(0, 3)).toBe(3));
  it('bid=1, tricks=3 → 2', () => expect(calcLoss(1, 3)).toBe(2));
  it('bid=0, tricks=0 → 0', () => expect(calcLoss(0, 0)).toBe(0));
});

describe('alivePlayers', () => {
  const makeState = (players: Player[]): GameState => ({
    players,
    round: 1,
    dealerIndex: 0,
    phase: 'bid',
    currentRound: null,
    history: [],
    startedAt: new Date().toISOString(),
  });

  it('filters out dead players', () => {
    const players: Player[] = [
      { id: '1', name: 'Alice', position: 0, lives: 5, alive: true },
      { id: '2', name: 'Bob', position: 1, lives: 0, alive: false },
      { id: '3', name: 'Charlie', position: 2, lives: 3, alive: true },
    ];
    const result = alivePlayers(makeState(players));
    expect(result).toHaveLength(2);
    expect(result.every(p => p.alive)).toBe(true);
  });

  it('sorts by position', () => {
    const players: Player[] = [
      { id: '3', name: 'Charlie', position: 2, lives: 3, alive: true },
      { id: '1', name: 'Alice', position: 0, lives: 5, alive: true },
      { id: '2', name: 'Bob', position: 1, lives: 2, alive: true },
    ];
    const result = alivePlayers(makeState(players));
    expect(result[0].position).toBe(0);
    expect(result[1].position).toBe(1);
    expect(result[2].position).toBe(2);
  });

  it('returns empty array when no alive players', () => {
    const players: Player[] = [
      { id: '1', name: 'Alice', position: 0, lives: 0, alive: false },
    ];
    expect(alivePlayers(makeState(players))).toHaveLength(0);
  });
});

describe('cardsOnTable', () => {
  const makeHandState = (overrides: Partial<PlayerHandState>): PlayerHandState => ({
    playerName: 'Alice',
    numPlayers: 4,
    round: 1,
    cardsPerPlayer: 3,
    manilha: null,
    handCards: [],
    otherPlayedCards: [],
    ...overrides,
  });

  it('4 players × 3 cards = 12 total; 2 hand played + 1 other = 3 played → 9 remaining', () => {
    const state = makeHandState({
      numPlayers: 4,
      cardsPerPlayer: 3,
      handCards: [
        { value: 'A', played: true },
        { value: 'K', played: true },
        { value: 'Q', played: false },
      ],
      otherPlayedCards: [{ value: '7' }],
    });
    expect(cardsOnTable(state)).toBe(9);
  });

  it('returns 0 when more cards played than total (floor at 0)', () => {
    const state = makeHandState({
      numPlayers: 2,
      cardsPerPlayer: 1,
      handCards: [{ value: 'A', played: true }],
      otherPlayedCards: [{ value: 'K' }, { value: 'Q' }],
    });
    expect(cardsOnTable(state)).toBe(0);
  });

  it('returns full count when nothing is played', () => {
    const state = makeHandState({
      numPlayers: 3,
      cardsPerPlayer: 2,
      handCards: [],
      otherPlayedCards: [],
    });
    expect(cardsOnTable(state)).toBe(6);
  });

  it('counts only played hand cards (not unplayed)', () => {
    const state = makeHandState({
      numPlayers: 2,
      cardsPerPlayer: 2,
      handCards: [
        { value: 'A', played: false },
        { value: 'K', played: true },
      ],
      otherPlayedCards: [],
    });
    expect(cardsOnTable(state)).toBe(3); // 4 total - 1 played = 3
  });
});

describe('getFirstBidderIndex', () => {
  const makePlayers = (n: number): Player[] =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i),
      name: `P${i}`,
      position: i,
      lives: 5,
      alive: true,
    }));

  it('returns (dealerIndex + 1) % alive.length', () => {
    const players = makePlayers(4);
    expect(getFirstBidderIndex(0, players)).toBe(1);
    expect(getFirstBidderIndex(3, players)).toBe(0);
  });

  it('returns 0 for empty alive array', () => {
    expect(getFirstBidderIndex(0, [])).toBe(0);
  });
});

describe('nextDealerIndex', () => {
  const makePlayers = (n: number): Player[] =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i),
      name: `P${i}`,
      position: i,
      lives: 5,
      alive: true,
    }));

  it('increments and wraps around', () => {
    const players = makePlayers(3);
    expect(nextDealerIndex(0, players)).toBe(1);
    expect(nextDealerIndex(2, players)).toBe(0);
  });

  it('returns 0 for empty alive array', () => {
    expect(nextDealerIndex(0, [])).toBe(0);
  });
});

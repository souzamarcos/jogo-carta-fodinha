import { describe, it, expect } from 'vitest';
import {
  compareCards,
  isManilha,
  compareManilhaSuits,
  sortHandStrongest,
  countRemainingNonManilha,
  countRemainingManilhaSuit,
} from '../cardUtils';
import type { HandCard, OtherPlayedCard, Card } from '@/types';

describe('compareCards', () => {
  it('4 < 5', () => expect(compareCards('4', '5')).toBeLessThan(0));
  it('5 < 6', () => expect(compareCards('5', '6')).toBeLessThan(0));
  it('6 < 7', () => expect(compareCards('6', '7')).toBeLessThan(0));
  it('7 < Q', () => expect(compareCards('7', 'Q')).toBeLessThan(0));
  it('Q < J', () => expect(compareCards('Q', 'J')).toBeLessThan(0));
  it('J < K', () => expect(compareCards('J', 'K')).toBeLessThan(0));
  it('K < A', () => expect(compareCards('K', 'A')).toBeLessThan(0));
  it('A < 2', () => expect(compareCards('A', '2')).toBeLessThan(0));
  it('2 < 3', () => expect(compareCards('2', '3')).toBeLessThan(0));
  it('3 > 4', () => expect(compareCards('3', '4')).toBeGreaterThan(0));
  it('equal values return 0', () => expect(compareCards('7', '7')).toBe(0));
  it('K > 4', () => expect(compareCards('K', '4')).toBeGreaterThan(0));
});

describe('isManilha', () => {
  it('returns true when card value matches manilha value', () => {
    const card: Card = { value: '7' };
    const manilha: Card = { value: '7' };
    expect(isManilha(card, manilha)).toBe(true);
  });

  it('returns false when card value does not match manilha value', () => {
    const card: Card = { value: '5' };
    const manilha: Card = { value: '7' };
    expect(isManilha(card, manilha)).toBe(false);
  });

  it('works regardless of suit', () => {
    const card: Card = { value: 'A', suit: 'espadas' };
    const manilha: Card = { value: 'A', suit: 'ouros' };
    expect(isManilha(card, manilha)).toBe(true);
  });
});

describe('compareManilhaSuits', () => {
  it('paus < copas', () => expect(compareManilhaSuits('paus', 'copas')).toBeLessThan(0));
  it('copas < espadas', () => expect(compareManilhaSuits('copas', 'espadas')).toBeLessThan(0));
  it('espadas < ouros', () => expect(compareManilhaSuits('espadas', 'ouros')).toBeLessThan(0));
  it('ouros > paus', () => expect(compareManilhaSuits('ouros', 'paus')).toBeGreaterThan(0));
  it('equal suits return 0', () => expect(compareManilhaSuits('copas', 'copas')).toBe(0));
});

describe('sortHandStrongest', () => {
  it('places manilha cards before non-manilha cards', () => {
    const manilha: Card = { value: '7' };
    const cards: HandCard[] = [
      { value: '3', played: false },
      { value: '7', suit: 'paus', played: false },
      { value: 'A', played: false },
    ];
    const sorted = sortHandStrongest(cards, manilha);
    expect(sorted[0].value).toBe('7');
  });

  it('sorts manilha cards by suit strength descending', () => {
    const manilha: Card = { value: '7' };
    const cards: HandCard[] = [
      { value: '7', suit: 'paus', played: false },
      { value: '7', suit: 'ouros', played: false },
      { value: '7', suit: 'espadas', played: false },
      { value: '7', suit: 'copas', played: false },
    ];
    const sorted = sortHandStrongest(cards, manilha);
    expect(sorted[0].suit).toBe('ouros');
    expect(sorted[1].suit).toBe('espadas');
    expect(sorted[2].suit).toBe('copas');
    expect(sorted[3].suit).toBe('paus');
  });

  it('sorts non-manilha by value descending', () => {
    const manilha: Card = { value: 'K' };
    const cards: HandCard[] = [
      { value: '4', played: false },
      { value: '3', played: false },
      { value: 'A', played: false },
    ];
    const sorted = sortHandStrongest(cards, manilha);
    expect(sorted[0].value).toBe('3');
    expect(sorted[1].value).toBe('A');
    expect(sorted[2].value).toBe('4');
  });

  it('handles null manilha (no manilha cards, sort by value desc)', () => {
    const cards: HandCard[] = [
      { value: '4', played: false },
      { value: '3', played: false },
      { value: 'Q', played: false },
    ];
    const sorted = sortHandStrongest(cards, null);
    expect(sorted[0].value).toBe('3');
    expect(sorted[2].value).toBe('4');
  });

  it('does not mutate original array', () => {
    const manilha: Card = { value: '5' };
    const cards: HandCard[] = [
      { value: 'A', played: false },
      { value: '5', suit: 'paus', played: false },
    ];
    const original = [...cards];
    sortHandStrongest(cards, manilha);
    expect(cards[0].value).toBe(original[0].value);
  });
});

describe('countRemainingNonManilha', () => {
  it('returns 4 when card appears nowhere', () => {
    expect(countRemainingNonManilha('A', [], [])).toBe(4);
  });

  it('subtracts cards in hand', () => {
    const handCards: HandCard[] = [
      { value: 'A', played: false },
      { value: 'A', played: true },
    ];
    expect(countRemainingNonManilha('A', handCards, [])).toBe(2);
  });

  it('subtracts cards played by others', () => {
    const otherPlayed: OtherPlayedCard[] = [{ value: 'A' }, { value: 'A' }];
    expect(countRemainingNonManilha('A', [], otherPlayed)).toBe(2);
  });

  it('ignores unknown entries in otherPlayed', () => {
    const otherPlayed: OtherPlayedCard[] = [{ value: 'unknown' }];
    expect(countRemainingNonManilha('A', [], otherPlayed)).toBe(4);
  });

  it('floors at 0 (never negative)', () => {
    const handCards: HandCard[] = [
      { value: 'K', played: false },
      { value: 'K', played: false },
      { value: 'K', played: false },
    ];
    const otherPlayed: OtherPlayedCard[] = [{ value: 'K' }, { value: 'K' }];
    expect(countRemainingNonManilha('K', handCards, otherPlayed)).toBe(0);
  });

  it('combines hand and played correctly', () => {
    const handCards: HandCard[] = [{ value: '7', played: false }];
    const otherPlayed: OtherPlayedCard[] = [{ value: '7' }];
    expect(countRemainingNonManilha('7', handCards, otherPlayed)).toBe(2);
  });
});

describe('countRemainingManilhaSuit', () => {
  it('returns 1 when not in hand and not played', () => {
    expect(countRemainingManilhaSuit('ouros', '7', [], [])).toBe(1);
  });

  it('returns 0 when card is in own hand', () => {
    const handCards: HandCard[] = [{ value: '7', suit: 'ouros', played: false }];
    expect(countRemainingManilhaSuit('ouros', '7', handCards, [])).toBe(0);
  });

  it('returns 0 when card has been played by others', () => {
    const otherPlayed: OtherPlayedCard[] = [{ value: '7', suit: 'ouros' }];
    expect(countRemainingManilhaSuit('ouros', '7', [], otherPlayed)).toBe(0);
  });

  it('returns 1 for a different suit of same manilha value', () => {
    const handCards: HandCard[] = [{ value: '7', suit: 'ouros', played: false }];
    expect(countRemainingManilhaSuit('paus', '7', handCards, [])).toBe(1);
  });

  it('never returns negative (0 even if somehow overcounted)', () => {
    const handCards: HandCard[] = [{ value: '7', suit: 'espadas', played: false }];
    const otherPlayed: OtherPlayedCard[] = [{ value: '7', suit: 'espadas' }];
    const result = countRemainingManilhaSuit('espadas', '7', handCards, otherPlayed);
    expect(result).toBe(0);
  });
});

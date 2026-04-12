import type { CardValue, CardSuit, HandCard, OtherPlayedCard, Card } from '@/types';
import { CARD_ORDER, SUIT_ORDER } from '@/types';

/** Compare two non-manilha card values. Returns positive if a > b. */
export function compareCards(a: CardValue, b: CardValue): number {
  return CARD_ORDER.indexOf(a) - CARD_ORDER.indexOf(b);
}

/** Returns true if card value matches the manilha value. */
export function isManilha(card: Card, manilha: Card): boolean {
  return card.value === manilha.value;
}

/** Compare two manilha suits by strength. Returns positive if a > b. */
export function compareManilhaSuits(a: CardSuit, b: CardSuit): number {
  return SUIT_ORDER.indexOf(a) - SUIT_ORDER.indexOf(b);
}

/** Sort hand cards strongest-first. Manilha cards always sort above non-manilha. */
export function sortHandStrongest(cards: HandCard[], manilha: Card | null): HandCard[] {
  return [...cards].sort((a, b) => {
    const aIsManilha = manilha ? isManilha(a, manilha) : false;
    const bIsManilha = manilha ? isManilha(b, manilha) : false;
    if (aIsManilha && bIsManilha) {
      // Both manilha: sort by suit strength desc
      const aSuit = a.suit ?? 'paus';
      const bSuit = b.suit ?? 'paus';
      return compareManilhaSuits(bSuit, aSuit);
    }
    if (aIsManilha) return -1;
    if (bIsManilha) return 1;
    return compareCards(b.value, a.value); // desc
  });
}

/** Count remaining copies of a non-manilha value that may still be in other hands. */
export function countRemainingNonManilha(
  value: CardValue,
  handCards: HandCard[],
  otherPlayed: OtherPlayedCard[]
): number {
  const inHand = handCards.filter(c => c.value === value).length;
  const played = otherPlayed.filter(c => c.value === value).length; // 'unknown' never equals value
  return Math.max(0, 4 - inHand - played);
}

/** Count remaining copies of a specific manilha suit in other players' hands (0 or 1). */
export function countRemainingManilhaSuit(
  suit: CardSuit,
  manilhaValue: CardValue,
  handCards: HandCard[],
  otherPlayed: OtherPlayedCard[]
): 0 | 1 {
  const inHand = handCards.some(c => c.value === manilhaValue && c.suit === suit) ? 1 : 0;
  const played = otherPlayed.filter(c => c.value === manilhaValue && c.suit === suit).length;
  return Math.max(0, 1 - inHand - played) as 0 | 1;
}

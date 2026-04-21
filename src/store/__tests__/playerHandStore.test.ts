import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerHandStore } from '../playerHandStore';

beforeEach(() => {
  usePlayerHandStore.setState({
    playerName: '',
    numPlayers: 2,
    round: 1,
    cardsPerPlayer: 1,
    manilha: null,
    handCards: [],
    otherPlayedCards: [],
    currentCycle: 1,
    cardsPlayedInCycle: 0,
    ownCardIndexThisCycle: null,
    otherCardsAddedThisCycle: 0,
  });
  localStorage.clear();
});

describe('playerHandStore - initSession', () => {
  it('sets playerName and numPlayers', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    const state = usePlayerHandStore.getState();
    expect(state.playerName).toBe('Alice');
    expect(state.numPlayers).toBe(4);
  });

  it('resets to round 1 on initSession', () => {
    usePlayerHandStore.setState({ round: 5 });
    usePlayerHandStore.getState().initSession('Bob', 3);
    expect(usePlayerHandStore.getState().round).toBe(1);
  });

  it('clears hand cards on initSession', () => {
    usePlayerHandStore.setState({
      handCards: [{ value: '4', played: false }],
    });
    usePlayerHandStore.getState().initSession('Carol', 2);
    expect(usePlayerHandStore.getState().handCards).toHaveLength(0);
  });

  it('clears other played cards on initSession', () => {
    usePlayerHandStore.setState({
      otherPlayedCards: [{ value: '5' }],
    });
    usePlayerHandStore.getState().initSession('Dan', 2);
    expect(usePlayerHandStore.getState().otherPlayedCards).toHaveLength(0);
  });
});

describe('playerHandStore - addHandCard', () => {
  it('appends HandCard with played=false', () => {
    usePlayerHandStore.getState().addHandCard('7', 'espadas');
    const state = usePlayerHandStore.getState();
    expect(state.handCards).toHaveLength(1);
    expect(state.handCards[0].value).toBe('7');
    expect(state.handCards[0].suit).toBe('espadas');
    expect(state.handCards[0].played).toBe(false);
  });

  it('appends multiple cards', () => {
    usePlayerHandStore.getState().addHandCard('A');
    usePlayerHandStore.getState().addHandCard('K', 'ouros');
    const state = usePlayerHandStore.getState();
    expect(state.handCards).toHaveLength(2);
  });

  it('works without suit', () => {
    usePlayerHandStore.getState().addHandCard('3');
    const state = usePlayerHandStore.getState();
    expect(state.handCards[0].suit).toBeUndefined();
    expect(state.handCards[0].played).toBe(false);
  });
});

describe('playerHandStore - toggleHandCardPlayed', () => {
  it('toggles played from false to true', () => {
    usePlayerHandStore.getState().addHandCard('Q');
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    expect(usePlayerHandStore.getState().handCards[0].played).toBe(true);
  });

  it('toggles played from true back to false', () => {
    usePlayerHandStore.getState().addHandCard('J');
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    expect(usePlayerHandStore.getState().handCards[0].played).toBe(false);
  });

  it('only toggles the specified index', () => {
    usePlayerHandStore.getState().addHandCard('2');
    usePlayerHandStore.getState().addHandCard('3');
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    const state = usePlayerHandStore.getState();
    expect(state.handCards[0].played).toBe(true);
    expect(state.handCards[1].played).toBe(false);
  });
});

describe('playerHandStore - finishRound', () => {
  it('increments round', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    expect(usePlayerHandStore.getState().round).toBe(1);
    usePlayerHandStore.getState().finishRound();
    expect(usePlayerHandStore.getState().round).toBe(2);
  });

  it('clears hand cards', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    usePlayerHandStore.getState().addHandCard('5', 'paus');
    usePlayerHandStore.getState().addHandCard('6', 'copas');
    usePlayerHandStore.getState().finishRound();
    expect(usePlayerHandStore.getState().handCards).toHaveLength(0);
  });

  it('clears other played cards', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: 'A' });
    usePlayerHandStore.getState().finishRound();
    expect(usePlayerHandStore.getState().otherPlayedCards).toHaveLength(0);
  });

  it('clears manilha', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    usePlayerHandStore.getState().setManilha({ value: '7' });
    usePlayerHandStore.getState().finishRound();
    expect(usePlayerHandStore.getState().manilha).toBeNull();
  });

  it('preserves playerName and numPlayers', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    usePlayerHandStore.getState().finishRound();
    const state = usePlayerHandStore.getState();
    expect(state.playerName).toBe('Alice');
    expect(state.numPlayers).toBe(4);
  });

  it('recalculates cardsPerPlayer correctly', () => {
    // 4 players, round 2 → min(2, floor(40/4)) = min(2, 10) = 2
    usePlayerHandStore.getState().initSession('Alice', 4);
    usePlayerHandStore.getState().finishRound(); // round becomes 2
    expect(usePlayerHandStore.getState().cardsPerPlayer).toBe(2);
  });

  it('caps cardsPerPlayer at floor(40/numPlayers)', () => {
    // 4 players, at round 11 → min(11, floor(40/4)) = min(11, 10) = 10
    usePlayerHandStore.setState({ round: 10, numPlayers: 4 });
    usePlayerHandStore.getState().finishRound(); // round becomes 11
    expect(usePlayerHandStore.getState().cardsPerPlayer).toBe(10);
  });
});

describe('playerHandStore — updateNumPlayers', () => {
  it('reduces numPlayers by 1 and recalculates cardsPerPlayer', () => {
    // 4 players, round 2 → cardsPerPlayer = min(2, floor(40/3)) = 2
    usePlayerHandStore.setState({ numPlayers: 4, round: 2, cardsPerPlayer: 2 });
    usePlayerHandStore.getState().updateNumPlayers(3);
    const state = usePlayerHandStore.getState();
    expect(state.numPlayers).toBe(3);
    expect(state.cardsPerPlayer).toBe(Math.min(2, Math.floor(40 / 3)));
  });

  it('increases numPlayers and recalculates cardsPerPlayer', () => {
    usePlayerHandStore.setState({ numPlayers: 3, round: 1, cardsPerPlayer: 1 });
    usePlayerHandStore.getState().updateNumPlayers(4);
    const state = usePlayerHandStore.getState();
    expect(state.numPlayers).toBe(4);
    expect(state.cardsPerPlayer).toBe(Math.min(1, Math.floor(40 / 4)));
  });

  it('clamps to minimum 2', () => {
    usePlayerHandStore.setState({ numPlayers: 2, round: 1, cardsPerPlayer: 1 });
    usePlayerHandStore.getState().updateNumPlayers(1);
    expect(usePlayerHandStore.getState().numPlayers).toBe(2);
  });

  it('clamps to maximum 10', () => {
    usePlayerHandStore.setState({ numPlayers: 10, round: 1, cardsPerPlayer: 1 });
    usePlayerHandStore.getState().updateNumPlayers(11);
    expect(usePlayerHandStore.getState().numPlayers).toBe(10);
  });

  it('at boundary — numPlayers 2 stays at 2', () => {
    usePlayerHandStore.setState({ numPlayers: 2, round: 1, cardsPerPlayer: 1 });
    usePlayerHandStore.getState().updateNumPlayers(2);
    expect(usePlayerHandStore.getState().numPlayers).toBe(2);
  });

  it('does not affect other state fields', () => {
    usePlayerHandStore.getState().initSession('Alice', 4);
    usePlayerHandStore.getState().setManilha({ value: '7' });
    usePlayerHandStore.getState().updateNumPlayers(3);
    const state = usePlayerHandStore.getState();
    expect(state.manilha).toEqual({ value: '7' });
    expect(state.round).toBe(1);
    expect(state.playerName).toBe('Alice');
  });
});

describe('playerHandStore — cycles', () => {
  function seedRound(numPlayers = 3, handSize = 2) {
    usePlayerHandStore.getState().initSession('Alice', numPlayers);
    for (let i = 0; i < handSize; i++) {
      usePlayerHandStore.getState().addHandCard(((i + 2) as unknown) as never);
    }
  }

  it('initSession seeds cycle state to defaults', () => {
    usePlayerHandStore.setState({
      currentCycle: 9,
      cardsPlayedInCycle: 7,
      ownCardIndexThisCycle: 3,
      otherCardsAddedThisCycle: 2,
    });
    usePlayerHandStore.getState().initSession('Alice', 3);
    const s = usePlayerHandStore.getState();
    expect(s.currentCycle).toBe(1);
    expect(s.cardsPlayedInCycle).toBe(0);
    expect(s.ownCardIndexThisCycle).toBeNull();
    expect(s.otherCardsAddedThisCycle).toBe(0);
  });

  it('toggleHandCardPlayed increments cardsPlayedInCycle and sets ownCardIndexThisCycle', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    const s = usePlayerHandStore.getState();
    expect(s.cardsPlayedInCycle).toBe(1);
    expect(s.ownCardIndexThisCycle).toBe(0);
    expect(s.handCards[0].played).toBe(true);
  });

  it('toggleHandCardPlayed blocks a second own card in the same cycle', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().toggleHandCardPlayed(1);
    const s = usePlayerHandStore.getState();
    expect(s.handCards[1].played).toBe(false);
    expect(s.cardsPlayedInCycle).toBe(1);
    expect(s.ownCardIndexThisCycle).toBe(0);
  });

  it('toggling off the current own card decrements counter and frees the slot', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    const s = usePlayerHandStore.getState();
    expect(s.handCards[0].played).toBe(false);
    expect(s.cardsPlayedInCycle).toBe(0);
    expect(s.ownCardIndexThisCycle).toBeNull();
    // now a different own card can be played in the same cycle
    usePlayerHandStore.getState().toggleHandCardPlayed(1);
    const s2 = usePlayerHandStore.getState();
    expect(s2.handCards[1].played).toBe(true);
    expect(s2.ownCardIndexThisCycle).toBe(1);
    expect(s2.cardsPlayedInCycle).toBe(1);
  });

  it('toggling off an own card played in a past cycle does not touch counters', () => {
    seedRound(3, 2);
    // cycle 1: play card 0, advance
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().advanceCycle();
    // cycle 2: play card 1
    usePlayerHandStore.getState().toggleHandCardPlayed(1);
    const before = usePlayerHandStore.getState();
    expect(before.cardsPlayedInCycle).toBe(1);
    expect(before.ownCardIndexThisCycle).toBe(1);
    // now toggle off the cycle-1 card — counters untouched
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    const after = usePlayerHandStore.getState();
    expect(after.handCards[0].played).toBe(false);
    expect(after.cardsPlayedInCycle).toBe(1);
    expect(after.ownCardIndexThisCycle).toBe(1);
  });

  it('addOtherPlayedCard is a no-op when cardsPlayedInCycle === numPlayers', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0); // own 1/3
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' }); // 2/3
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '5' }); // 3/3
    // cycle now at 3/3 — further adds are no-op
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '6' });
    const s = usePlayerHandStore.getState();
    expect(s.otherPlayedCards).toHaveLength(2);
    expect(s.cardsPlayedInCycle).toBe(3);
    expect(s.otherCardsAddedThisCycle).toBe(2);
  });

  it('addOtherPlayedCard reserves one slot per cycle for the own card (blocks at numPlayers - 1 until own is played)', () => {
    seedRound(3, 2);
    // No own card yet — only numPlayers - 1 = 2 others may be added
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '5' });
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '6' });
    const s = usePlayerHandStore.getState();
    expect(s.otherPlayedCards).toHaveLength(2);
    expect(s.cardsPlayedInCycle).toBe(2);
    expect(s.otherCardsAddedThisCycle).toBe(2);
    // Once the own card is played, cycle fills to 3/3
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    const s2 = usePlayerHandStore.getState();
    expect(s2.cardsPlayedInCycle).toBe(3);
  });

  it('addOtherPlayedCard increments both cardsPlayedInCycle and otherCardsAddedThisCycle', () => {
    seedRound(4, 2);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    const s = usePlayerHandStore.getState();
    expect(s.cardsPlayedInCycle).toBe(1);
    expect(s.otherCardsAddedThisCycle).toBe(1);
    expect(s.otherPlayedCards).toHaveLength(1);
  });

  it('removeOtherPlayedCard decrements only when the removed card is in the current-cycle window', () => {
    seedRound(3, 2);
    // cycle 1: play own + two others, advance
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '5' });
    usePlayerHandStore.getState().advanceCycle();
    // cycle 2: add one other (index 2 is the current-cycle one)
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '6' });
    const before = usePlayerHandStore.getState();
    expect(before.cardsPlayedInCycle).toBe(1);
    expect(before.otherCardsAddedThisCycle).toBe(1);
    // removing the current-cycle card decrements
    usePlayerHandStore.getState().removeOtherPlayedCard(2);
    const after = usePlayerHandStore.getState();
    expect(after.cardsPlayedInCycle).toBe(0);
    expect(after.otherCardsAddedThisCycle).toBe(0);
    expect(after.otherPlayedCards).toHaveLength(2);
  });

  it('removeOtherPlayedCard leaves counters alone when removing a past-cycle card', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '5' });
    usePlayerHandStore.getState().advanceCycle();
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '6' });
    // remove index 0 — a past-cycle card
    usePlayerHandStore.getState().removeOtherPlayedCard(0);
    const s = usePlayerHandStore.getState();
    expect(s.otherPlayedCards).toHaveLength(2);
    expect(s.cardsPlayedInCycle).toBe(1);
    expect(s.otherCardsAddedThisCycle).toBe(1);
  });

  it('clearOtherPlayedCards subtracts otherCardsAddedThisCycle from the cycle counter and resets it', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0); // 1/3 own
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' }); // 2/3
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '5' }); // 3/3
    usePlayerHandStore.getState().clearOtherPlayedCards();
    const s = usePlayerHandStore.getState();
    expect(s.otherPlayedCards).toHaveLength(0);
    expect(s.otherCardsAddedThisCycle).toBe(0);
    expect(s.cardsPlayedInCycle).toBe(1); // own card still counted
  });

  it('advanceCycle is a no-op when cardsPlayedInCycle === 0', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().advanceCycle();
    expect(usePlayerHandStore.getState().currentCycle).toBe(1);
  });

  it('advanceCycle is a no-op when the own card has not been played this cycle', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '5' });
    // counter = 2 but own not played — advance must be blocked
    usePlayerHandStore.getState().advanceCycle();
    expect(usePlayerHandStore.getState().currentCycle).toBe(1);
  });

  it('advanceCycle increments currentCycle and resets per-cycle counters', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    usePlayerHandStore.getState().advanceCycle();
    const s = usePlayerHandStore.getState();
    expect(s.currentCycle).toBe(2);
    expect(s.cardsPlayedInCycle).toBe(0);
    expect(s.ownCardIndexThisCycle).toBeNull();
    expect(s.otherCardsAddedThisCycle).toBe(0);
    // the previously played own card stays played
    expect(s.handCards[0].played).toBe(true);
  });

  it('previousCycle is a no-op when currentCycle === 1', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().previousCycle();
    expect(usePlayerHandStore.getState().currentCycle).toBe(1);
  });

  it('previousCycle is a no-op when cardsPlayedInCycle > 0', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().advanceCycle();
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    // cycle 2 has 1 card — previousCycle must be blocked
    usePlayerHandStore.getState().previousCycle();
    expect(usePlayerHandStore.getState().currentCycle).toBe(2);
  });

  it('previousCycle decrements currentCycle and does not restore past counters', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().advanceCycle();
    usePlayerHandStore.getState().previousCycle();
    const s = usePlayerHandStore.getState();
    expect(s.currentCycle).toBe(1);
    expect(s.cardsPlayedInCycle).toBe(0);
    expect(s.ownCardIndexThisCycle).toBeNull();
  });

  it('finishRound resets cycle state to defaults', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().advanceCycle();
    usePlayerHandStore.getState().toggleHandCardPlayed(1);
    usePlayerHandStore.getState().finishRound();
    const s = usePlayerHandStore.getState();
    expect(s.currentCycle).toBe(1);
    expect(s.cardsPlayedInCycle).toBe(0);
    expect(s.ownCardIndexThisCycle).toBeNull();
    expect(s.otherCardsAddedThisCycle).toBe(0);
  });

  it('cycle state round-trips through the persist partialize selector', () => {
    seedRound(3, 2);
    usePlayerHandStore.getState().toggleHandCardPlayed(0);
    usePlayerHandStore.getState().addOtherPlayedCard({ value: '4' });
    const raw = localStorage.getItem('fodinha-hand');
    expect(raw).not.toBeNull();
    const persisted = JSON.parse(raw as string);
    expect(persisted.state.currentCycle).toBe(1);
    expect(persisted.state.cardsPlayedInCycle).toBe(2);
    expect(persisted.state.ownCardIndexThisCycle).toBe(0);
    expect(persisted.state.otherCardsAddedThisCycle).toBe(1);
    expect(persisted.version).toBe(2);
  });
});


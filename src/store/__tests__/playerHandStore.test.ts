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

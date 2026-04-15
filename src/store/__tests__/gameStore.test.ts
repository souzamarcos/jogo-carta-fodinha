import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, initialGameState } from '../gameStore';

beforeEach(() => {
  useGameStore.setState({ ...initialGameState, startedAt: new Date().toISOString() });
  localStorage.clear();
});

describe('gameStore - startGame', () => {
  it('creates players with correct initial state', () => {
    useGameStore.getState().startGame([
      { name: 'Alice' },
      { name: 'Bob' },
      { name: 'Charlie' },
    ]);

    const state = useGameStore.getState();
    expect(state.players).toHaveLength(3);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
    expect(state.players[2].name).toBe('Charlie');
    expect(state.players.every(p => p.lives === 5)).toBe(true);
    expect(state.players.every(p => p.alive === true)).toBe(true);
    expect(state.players[0].position).toBe(0);
    expect(state.players[1].position).toBe(1);
    expect(state.players[2].position).toBe(2);
    expect(state.round).toBe(1);
    expect(state.phase).toBe('bid');
    expect(state.history).toHaveLength(0);
    expect(state.currentRound).not.toBeNull();
    expect(state.currentRound?.cardsPerPlayer).toBe(1);
  });

  it('trims player names', () => {
    useGameStore.getState().startGame([{ name: '  Alice  ' }, { name: ' Bob ' }]);
    const state = useGameStore.getState();
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
  });

  it('assigns unique IDs to players', () => {
    useGameStore.getState().startGame([{ name: 'A' }, { name: 'B' }]);
    const state = useGameStore.getState();
    expect(state.players[0].id).not.toBe(state.players[1].id);
  });
});

describe('gameStore - setBid', () => {
  it('updates bids map for a player', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const playerId = state.players[0].id;

    useGameStore.getState().setBid(playerId, 2);

    const updated = useGameStore.getState();
    expect(updated.currentRound?.bids[playerId]).toBe(2);
  });

  it('can set bids for multiple players', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 3);

    const updated = useGameStore.getState();
    expect(updated.currentRound?.bids[p1.id]).toBe(1);
    expect(updated.currentRound?.bids[p2.id]).toBe(3);
  });
});

describe('gameStore - startRound', () => {
  it('pre-fills tricks with bid values', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    useGameStore.getState().setManilha({ value: '7' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().startRound();

    const { currentRound } = useGameStore.getState();
    expect(currentRound?.tricks[p1.id]).toBe(1);
    expect(currentRound?.tricks[p2.id]).toBe(0);
  });

  it('sets phase to playing and records startedAt', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    useGameStore.getState().setManilha({ value: 'K' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().startRound();

    const updated = useGameStore.getState();
    expect(updated.phase).toBe('playing');
    expect(updated.currentRound?.startedAt).toBeTruthy();
  });
});

describe('gameStore - confirmResult', () => {
  it('loses 2 lives when bid=2 tricks=0', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    // Set bids and tricks
    useGameStore.getState().setBid(p1.id, 2);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 1);
    useGameStore.getState().confirmResult();

    const updated = useGameStore.getState();
    const updatedP1 = updated.players.find(p => p.id === p1.id)!;
    expect(updatedP1.lives).toBe(3); // 5 - 2
  });

  it('loses 0 lives when bid equals tricks', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setTricks(p1.id, 1);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().confirmResult();

    const updated = useGameStore.getState();
    const updatedP1 = updated.players.find(p => p.id === p1.id)!;
    expect(updatedP1.lives).toBe(5); // no loss
  });

  it('advances to next round on successful confirmResult with multiple alive', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;

    useGameStore.getState().setBid(p1.id, 0);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setBid(p3.id, 1);
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().setTricks(p3.id, 1);
    useGameStore.getState().confirmResult();

    const updated = useGameStore.getState();
    expect(updated.phase).toBe('bid');
    expect(updated.round).toBe(2);
    expect(updated.history).toHaveLength(1);
  });

  it('transitions to finished when only one player survives', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    // Give p2 only 1 life by manually setting state
    useGameStore.setState({
      players: state.players.map(p =>
        p.id === p2.id ? { ...p, lives: 1 } : p
      ),
    });

    // p2 loses 1 life (bid=1, tricks=0 → loss=1)
    useGameStore.getState().setBid(p1.id, 0);
    useGameStore.getState().setBid(p2.id, 1);
    useGameStore.getState().setTricks(p1.id, 1);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().confirmResult();

    const updated = useGameStore.getState();
    expect(updated.phase).toBe('finished');
    const updatedP2 = updated.players.find(p => p.id === p2.id)!;
    expect(updatedP2.alive).toBe(false);
    expect(updatedP2.lives).toBe(0);
  });

  it('adds entry to history', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setTricks(p1.id, 1);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().confirmResult();

    const updated = useGameStore.getState();
    expect(updated.history).toHaveLength(1);
    expect(updated.history[0].round).toBe(1);
  });
});

describe('gameStore - bidSubPhase transitions', () => {
  it('startGame sets bidSubPhase to manilha and manilha to null', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    expect(state.currentRound?.bidSubPhase).toBe('manilha');
    expect(state.currentRound?.manilha).toBeNull();
  });

  it('startGame sets dealerIndex to 0', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    expect(useGameStore.getState().dealerIndex).toBe(0);
  });

  it('setManilha transitions bidSubPhase to dealer on round 1', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    useGameStore.getState().setManilha({ value: '7' });
    const state = useGameStore.getState();
    expect(state.currentRound?.bidSubPhase).toBe('dealer');
    expect(state.currentRound?.manilha?.value).toBe('7');
  });

  it('setManilha transitions bidSubPhase to bids on round 2+', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    useGameStore.setState({ round: 2 });
    useGameStore.getState().setManilha({ value: 'K' });
    expect(useGameStore.getState().currentRound?.bidSubPhase).toBe('bids');
  });

  it('editDealer transitions bidSubPhase back to dealer', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    useGameStore.setState({ round: 2 });
    useGameStore.getState().setManilha({ value: 'K' }); // goes to 'bids'
    useGameStore.getState().editDealer();
    expect(useGameStore.getState().currentRound?.bidSubPhase).toBe('dealer');
  });

  it('clearManilha resets bidSubPhase to manilha and manilha to null', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    useGameStore.getState().setManilha({ value: '7' });
    useGameStore.getState().clearManilha();
    const state = useGameStore.getState();
    expect(state.currentRound?.bidSubPhase).toBe('manilha');
    expect(state.currentRound?.manilha).toBeNull();
  });

  it('confirmDealer transitions bidSubPhase to bids', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer();
    expect(useGameStore.getState().currentRound?.bidSubPhase).toBe('bids');
  });

  it('confirmDealer with no override keeps current dealerIndex', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer();
    expect(useGameStore.getState().dealerIndex).toBe(0);
  });

  it('confirmDealer with overrideDealerIndex updates dealerIndex and firstBidderIndex', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer(2); // override: Charlie deals
    const state = useGameStore.getState();
    expect(state.dealerIndex).toBe(2);
    expect(state.currentRound?.firstBidderIndex).toBe(0); // (2+1)%3 = 0
  });

  it('confirmResult advancing to next round resets bidSubPhase to manilha', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 0);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setBid(p3.id, 1);
    useGameStore.getState().startRound();
    useGameStore.getState().endRound();
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().setTricks(p3.id, 1);
    useGameStore.getState().confirmResult();
    const updated = useGameStore.getState();
    expect(updated.currentRound?.bidSubPhase).toBe('manilha');
    expect(updated.currentRound?.manilha).toBeNull();
  });

  it('startTiebreakRound sets bidSubPhase to manilha', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;
    // Reduce both to 1 life
    useGameStore.setState({
      players: state.players.map(p => ({ ...p, lives: 1 })),
    });
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().setBid(p2.id, 1);
    useGameStore.getState().startRound();
    useGameStore.getState().endRound();
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 1);
    useGameStore.getState().confirmResult(); // both eliminated → tiebreak
    useGameStore.getState().startTiebreakRound();
    expect(useGameStore.getState().currentRound?.bidSubPhase).toBe('manilha');
  });
});

describe('gameStore - dealer rotation', () => {
  it('dealer advances by 1 after each round', () => {
    useGameStore.getState().startGame([{ name: 'A' }, { name: 'B' }, { name: 'C' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;
    expect(useGameStore.getState().dealerIndex).toBe(0);

    // Complete round 1
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 0);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setBid(p3.id, 1);
    useGameStore.getState().startRound();
    useGameStore.getState().endRound();
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().setTricks(p3.id, 1);
    useGameStore.getState().confirmResult();
    expect(useGameStore.getState().dealerIndex).toBe(1);
  });

  it('dealer wraps from last to first player', () => {
    useGameStore.getState().startGame([{ name: 'A' }, { name: 'B' }]);
    const state = useGameStore.getState();
    const [p1, p2] = state.players;

    // Override dealer to last position (1)
    useGameStore.setState({ dealerIndex: 1 });
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 0);
    useGameStore.getState().setBid(p2.id, 1);
    useGameStore.getState().startRound();
    useGameStore.getState().endRound();
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 1);
    useGameStore.getState().confirmResult();
    expect(useGameStore.getState().dealerIndex).toBe(0); // wrapped back to 0
  });

  it('manual dealer override persists as base for next rotation', () => {
    useGameStore.getState().startGame([{ name: 'A' }, { name: 'B' }, { name: 'C' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;

    // Override dealer to index 2 (Charlie)
    useGameStore.getState().setManilha({ value: 'A' });
    useGameStore.getState().confirmDealer(2);
    expect(useGameStore.getState().dealerIndex).toBe(2);

    useGameStore.getState().setBid(p1.id, 0);
    useGameStore.getState().setBid(p2.id, 0);
    useGameStore.getState().setBid(p3.id, 1);
    useGameStore.getState().startRound();
    useGameStore.getState().endRound();
    useGameStore.getState().setTricks(p1.id, 0);
    useGameStore.getState().setTricks(p2.id, 0);
    useGameStore.getState().setTricks(p3.id, 1);
    useGameStore.getState().confirmResult();
    // Next dealer = (2+1)%3 = 0 (Alice)
    expect(useGameStore.getState().dealerIndex).toBe(0);
  });
});

describe('gameStore - rematch', () => {
  it('resets lives and round to initial values', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);
    const state = useGameStore.getState();
    const [p1] = state.players;

    // Reduce a player's lives
    useGameStore.setState({
      players: state.players.map(p =>
        p.id === p1.id ? { ...p, lives: 2 } : p
      ),
      round: 5,
    });

    useGameStore.getState().rematch();

    const updated = useGameStore.getState();
    expect(updated.round).toBe(1);
    expect(updated.dealerIndex).toBe(0);
    expect(updated.players.every(p => p.lives === 5)).toBe(true);
    expect(updated.players.every(p => p.alive === true)).toBe(true);
    expect(updated.phase).toBe('bid');
    expect(updated.currentRound?.bidSubPhase).toBe('manilha');
    expect(updated.history).toHaveLength(0);
  });

  it('preserves player names and positions', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }]);

    useGameStore.getState().rematch();

    const updated = useGameStore.getState();
    expect(updated.players.map(p => p.name)).toEqual(['Alice', 'Bob']);
    expect(updated.players.map(p => p.position)).toEqual([0, 1]);
  });
});

describe('gameStore — startRound normalization', () => {
  it('normalizes bids to include all alive players', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;

    useGameStore.getState().setManilha({ value: '7' });
    useGameStore.getState().confirmDealer();
    // Only p1 sets a bid explicitly; p2 and p3 keep the default 0
    useGameStore.getState().setBid(p1.id, 2);
    useGameStore.getState().startRound();

    const { currentRound } = useGameStore.getState();
    expect(Object.keys(currentRound!.bids)).toHaveLength(3);
    expect(currentRound!.bids[p1.id]).toBe(2);
    expect(currentRound!.bids[p2.id]).toBe(0);
    expect(currentRound!.bids[p3.id]).toBe(0);
  });

  it('seeds tricks from normalized bids', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;

    useGameStore.getState().setManilha({ value: '7' });
    useGameStore.getState().confirmDealer();
    useGameStore.getState().setBid(p1.id, 2);
    // p2 and p3 keep default bid of 0
    useGameStore.getState().startRound();

    const { currentRound } = useGameStore.getState();
    expect(Object.keys(currentRound!.tricks)).toHaveLength(3);
    expect(currentRound!.tricks[p1.id]).toBe(currentRound!.bids[p1.id]);
    expect(currentRound!.tricks[p2.id]).toBe(currentRound!.bids[p2.id]);
    expect(currentRound!.tricks[p3.id]).toBe(currentRound!.bids[p3.id]);
  });

  it('confirmResult stores complete bids and tricks in history', () => {
    useGameStore.getState().startGame([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]);
    const state = useGameStore.getState();
    const [p1, p2, p3] = state.players;

    useGameStore.getState().setManilha({ value: 'K' });
    useGameStore.getState().confirmDealer();
    // Only p1 sets a bid; p2 and p3 keep default 0
    useGameStore.getState().setBid(p1.id, 1);
    useGameStore.getState().startRound();
    useGameStore.getState().confirmResult();

    const { history } = useGameStore.getState();
    expect(history).toHaveLength(1);
    // All 3 players must have entries in bids and tricks
    expect(history[0].bids[p1.id]).toBe(1);
    expect(history[0].bids[p2.id]).toBe(0);
    expect(history[0].bids[p3.id]).toBe(0);
    expect(history[0].tricks[p1.id]).toBe(1);
    expect(history[0].tricks[p2.id]).toBe(0);
    expect(history[0].tricks[p3.id]).toBe(0);
  });
});

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
    expect(updated.players.every(p => p.lives === 5)).toBe(true);
    expect(updated.players.every(p => p.alive === true)).toBe(true);
    expect(updated.phase).toBe('bid');
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

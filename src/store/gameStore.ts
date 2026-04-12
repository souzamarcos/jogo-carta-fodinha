import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { GameState, GamePhase, Player, RoundHistory, Card } from '@/types';

// Helper: get alive players sorted by position
function alivePlayers(players: Player[]): Player[] {
  return players.filter(p => p.alive).sort((a, b) => a.position - b.position);
}

// Helper: cards per player formula
function calcCardsPerPlayer(round: number, aliveCount: number): number {
  return Math.min(round, Math.floor(40 / aliveCount));
}

// Helper: lives lost
function calcLoss(bid: number, tricks: number): number {
  return Math.abs(bid - tricks);
}

// Helper: random int in [0, n)
function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

interface GameStore extends GameState {
  // Actions
  startGame(players: { name: string }[]): void;
  rematch(): void;
  resetGame(): void;
  setManilha(card: Card): void;
  setBid(playerId: string, bid: number): void;
  startRound(): void;
  endRound(): void;
  setTricks(playerId: string, tricks: number): void;
  confirmResult(): void;
  declareTie(): void;
  startTiebreakRound(): void;
}

export const initialGameState: GameState = {
  players: [],
  round: 1,
  dealerIndex: 0,
  phase: 'setup',
  currentRound: null,
  history: [],
  startedAt: new Date().toISOString(),
  finishedAt: undefined,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialGameState,

      startGame(players) {
        const now = new Date().toISOString();
        const gamePlayers: Player[] = players.map((p, i) => ({
          id: uuidv4(),
          name: p.name.trim(),
          position: i,
          lives: 5,
          alive: true,
        }));
        const alive = gamePlayers.filter(p => p.alive);
        const dealerIdx = randInt(alive.length);
        const cardsPerPlayer = calcCardsPerPlayer(1, alive.length);
        const firstBidderIndex = (dealerIdx + 1) % alive.length;
        set({
          players: gamePlayers,
          round: 1,
          dealerIndex: dealerIdx,
          phase: 'bid',
          currentRound: {
            manilha: { value: '4' }, // placeholder, must be set via setManilha
            cardsPerPlayer,
            bids: {},
            tricks: {},
            startedAt: now,
            firstBidderIndex,
          },
          history: [],
          startedAt: now,
          finishedAt: undefined,
        });
      },

      rematch() {
        const { players } = get();
        const now = new Date().toISOString();
        const resetPlayers = players.map(p => ({ ...p, lives: 5, alive: true }));
        const alive = resetPlayers.filter(p => p.alive);
        const dealerIdx = randInt(alive.length);
        const cardsPerPlayer = calcCardsPerPlayer(1, alive.length);
        const firstBidderIndex = (dealerIdx + 1) % alive.length;
        set({
          players: resetPlayers,
          round: 1,
          dealerIndex: dealerIdx,
          phase: 'bid',
          currentRound: {
            manilha: { value: '4' },
            cardsPerPlayer,
            bids: {},
            tricks: {},
            startedAt: now,
            firstBidderIndex,
          },
          history: [],
          startedAt: now,
          finishedAt: undefined,
        });
      },

      resetGame() {
        set({ ...initialGameState, startedAt: new Date().toISOString() });
      },

      setManilha(card) {
        const { currentRound } = get();
        if (!currentRound) return;
        set({ currentRound: { ...currentRound, manilha: card } });
      },

      setBid(playerId, bid) {
        const { currentRound } = get();
        if (!currentRound) return;
        set({
          currentRound: {
            ...currentRound,
            bids: { ...currentRound.bids, [playerId]: bid },
          },
        });
      },

      startRound() {
        const { currentRound } = get();
        if (!currentRound) return;
        set({
          phase: 'playing',
          currentRound: { ...currentRound, startedAt: new Date().toISOString() },
        });
      },

      endRound() {
        set({ phase: 'result' });
      },

      setTricks(playerId, tricks) {
        const { currentRound } = get();
        if (!currentRound) return;
        set({
          currentRound: {
            ...currentRound,
            tricks: { ...currentRound.tricks, [playerId]: tricks },
          },
        });
      },

      confirmResult() {
        const { players, currentRound, round, dealerIndex, history } = get();
        if (!currentRound) return;

        const alive = alivePlayers(players);
        const losses: Record<string, number> = {};
        const updatedPlayers = players.map(p => {
          if (!p.alive) return p;
          const bid = currentRound.bids[p.id] ?? 0;
          const tricks = currentRound.tricks[p.id] ?? 0;
          const loss = calcLoss(bid, tricks);
          losses[p.id] = loss;
          const newLives = Math.max(0, p.lives - loss);
          return { ...p, lives: newLives, alive: newLives > 0 };
        });

        const historyEntry: RoundHistory = {
          round,
          manilha: currentRound.manilha,
          cardsPerPlayer: currentRound.cardsPerPlayer,
          bids: currentRound.bids,
          tricks: currentRound.tricks,
          losses,
        };

        const newAlive = updatedPlayers.filter(p => p.alive);
        const justEliminated = alive.filter(p => {
          const updated = updatedPlayers.find(u => u.id === p.id)!;
          return !updated.alive;
        });

        let newPhase: GamePhase;
        let newFinishedAt: string | undefined;

        if (justEliminated.length > 1 && newAlive.length === 0) {
          // All remaining players eliminated simultaneously → tiebreak
          newPhase = 'tiebreak';
        } else if (newAlive.length <= 1) {
          // One or zero survivors → finished
          newPhase = 'finished';
          newFinishedAt = new Date().toISOString();
        } else {
          newPhase = 'bid';
        }

        const newRound = round + 1;
        const newDealerIndex = newAlive.length > 0
          ? (dealerIndex + 1) % newAlive.length
          : dealerIndex;

        const nextCardsPerPlayer = newAlive.length > 0
          ? calcCardsPerPlayer(newRound, newAlive.length)
          : 1;
        const nextFirstBidder = newAlive.length > 0
          ? (newDealerIndex + 1) % newAlive.length
          : 0;

        set({
          players: updatedPlayers,
          round: newPhase === 'bid' ? newRound : round,
          dealerIndex: newPhase === 'bid' ? newDealerIndex : dealerIndex,
          phase: newPhase,
          currentRound: newPhase === 'bid'
            ? {
                manilha: { value: '4' },
                cardsPerPlayer: nextCardsPerPlayer,
                bids: {},
                tricks: {},
                startedAt: new Date().toISOString(),
                firstBidderIndex: nextFirstBidder,
              }
            : currentRound,
          history: [...history, historyEntry],
          finishedAt: newFinishedAt,
        });
      },

      declareTie() {
        set({ phase: 'finished', finishedAt: new Date().toISOString() });
      },

      startTiebreakRound() {
        const { players, round, dealerIndex } = get();
        // Tiebreak: players with lives === 0 from last result participate
        const tieParticipants = players.filter(p => p.lives === 0);
        // Revive them with 1 life each for tiebreak
        const updatedPlayers = players.map(p => {
          if (tieParticipants.find(t => t.id === p.id)) {
            return { ...p, lives: 1, alive: true };
          }
          return p;
        });
        const newAlive = updatedPlayers.filter(p => p.alive);
        const newRound = round + 1;
        const newDealerIndex = (dealerIndex + 1) % newAlive.length;
        const firstBidder = (newDealerIndex + 1) % newAlive.length;

        set({
          players: updatedPlayers,
          round: newRound,
          dealerIndex: newDealerIndex,
          phase: 'bid',
          currentRound: {
            manilha: { value: '4' },
            cardsPerPlayer: 1, // tiebreak always starts at 1
            bids: {},
            tricks: {},
            startedAt: new Date().toISOString(),
            firstBidderIndex: firstBidder,
          },
        });
      },
    }),
    {
      name: 'fodinha-game',
      version: 1,
      partialize: (state) => ({
        players: state.players,
        round: state.round,
        dealerIndex: state.dealerIndex,
        phase: state.phase,
        currentRound: state.currentRound,
        history: state.history,
        startedAt: state.startedAt,
        finishedAt: state.finishedAt,
      }),
    }
  )
);

export { alivePlayers, calcCardsPerPlayer, calcLoss };

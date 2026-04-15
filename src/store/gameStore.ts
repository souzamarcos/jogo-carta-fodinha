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

interface GameStore extends GameState {
  // Actions
  startGame(players: { name: string }[]): void;
  rematch(): void;
  resetGame(): void;
  setManilha(card: Card): void;
  clearManilha(): void;
  confirmDealer(overrideDealerIndex?: number): void;
  editDealer(): void;
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
        const dealerIdx = 0; // first player in registration order deals round 1
        const cardsPerPlayer = calcCardsPerPlayer(1, alive.length);
        const firstBidderIndex = (dealerIdx + 1) % alive.length;
        set({
          players: gamePlayers,
          round: 1,
          dealerIndex: dealerIdx,
          phase: 'bid',
          currentRound: {
            manilha: null,
            cardsPerPlayer,
            bids: {},
            tricks: {},
            startedAt: now,
            firstBidderIndex,
            bidSubPhase: 'manilha',
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
        const dealerIdx = 0;
        const cardsPerPlayer = calcCardsPerPlayer(1, alive.length);
        const firstBidderIndex = (dealerIdx + 1) % alive.length;
        set({
          players: resetPlayers,
          round: 1,
          dealerIndex: dealerIdx,
          phase: 'bid',
          currentRound: {
            manilha: null,
            cardsPerPlayer,
            bids: {},
            tricks: {},
            startedAt: now,
            firstBidderIndex,
            bidSubPhase: 'manilha',
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
        const { currentRound, round } = get();
        if (!currentRound) return;
        // Round 1: show dealer selection step; round 2+: skip directly to bids
        set({
          currentRound: {
            ...currentRound,
            manilha: card,
            bidSubPhase: round === 1 ? 'dealer' : 'bids',
          },
        });
      },

      clearManilha() {
        const { currentRound } = get();
        if (!currentRound) return;
        set({
          currentRound: {
            ...currentRound,
            manilha: null,
            bidSubPhase: 'manilha',
          },
        });
      },

      editDealer() {
        const { currentRound } = get();
        if (!currentRound) return;
        set({ currentRound: { ...currentRound, bidSubPhase: 'dealer' } });
      },

      confirmDealer(overrideDealerIndex) {
        const { currentRound, dealerIndex, players } = get();
        if (!currentRound) return;
        const alive = alivePlayers(players);
        const newDealerIndex = overrideDealerIndex !== undefined ? overrideDealerIndex : dealerIndex;
        const firstBidderIndex = alive.length > 0 ? (newDealerIndex + 1) % alive.length : 0;
        set({
          dealerIndex: newDealerIndex,
          currentRound: {
            ...currentRound,
            firstBidderIndex,
            bidSubPhase: 'bids',
          },
        });
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
        const { currentRound, players } = get();
        if (!currentRound) return;
        const alive = alivePlayers(players);
        const normalizedBids: Record<string, number> = {};
        for (const p of alive) {
          normalizedBids[p.id] = currentRound.bids[p.id] ?? 0;
        }
        set({
          phase: 'playing',
          currentRound: {
            ...currentRound,
            startedAt: new Date().toISOString(),
            bids: normalizedBids,
            tricks: { ...normalizedBids },
          },
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
          manilha: currentRound.manilha ?? { value: '4' as const },
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
          newPhase = 'tiebreak';
        } else if (newAlive.length <= 1) {
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
                manilha: null,
                cardsPerPlayer: nextCardsPerPlayer,
                bids: {},
                tricks: {},
                startedAt: new Date().toISOString(),
                firstBidderIndex: nextFirstBidder,
                bidSubPhase: 'manilha',
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
        const tieParticipants = players.filter(p => p.lives === 0);
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
            manilha: null,
            cardsPerPlayer: 1,
            bids: {},
            tricks: {},
            startedAt: new Date().toISOString(),
            firstBidderIndex: firstBidder,
            bidSubPhase: 'manilha',
          },
        });
      },
    }),
    {
      name: 'fodinha-game',
      version: 3,
      migrate(persistedState: unknown, fromVersion: number) {
        const state = persistedState as Record<string, unknown>;
        if (fromVersion < 2) {
          // Add bidSubPhase to any persisted currentRound that lacks it
          if (state.currentRound && typeof state.currentRound === 'object') {
            const cr = state.currentRound as Record<string, unknown>;
            if (!cr.bidSubPhase) {
              cr.bidSubPhase = 'bids';
            }
          }
        }
        // fromVersion < 3: tricks may be empty when phase === 'playing' (old persisted state).
        // Safe to leave as-is — empty tricks record defaults to 0 for each player in the UI.
        return state as unknown as GameState;
      },
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

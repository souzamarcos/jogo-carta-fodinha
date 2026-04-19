import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerHandState, HandCard, OtherPlayedCard, Card, CardValue, CardSuit } from '@/types';

interface PlayerHandStoreActions {
  initSession(playerName: string, numPlayers: number): void;
  setManilha(card: Card | null): void;
  addHandCard(value: CardValue, suit?: CardSuit): void;
  removeHandCard(index: number): void;
  toggleHandCardPlayed(index: number): void;
  addOtherPlayedCard(card: OtherPlayedCard): void;
  removeOtherPlayedCard(index: number): void;
  clearOtherPlayedCards(): void;
  finishRound(): void;
  reset(): void;
  updateNumPlayers(n: number): void;
  advanceCycle(): void;
  previousCycle(): void;
}

type PlayerHandStore = PlayerHandState & PlayerHandStoreActions;

const initialPlayerHandState: PlayerHandState = {
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
};

const resetCycleFields = {
  currentCycle: 1,
  cardsPlayedInCycle: 0,
  ownCardIndexThisCycle: null,
  otherCardsAddedThisCycle: 0,
} as const;

export const usePlayerHandStore = create<PlayerHandStore>()(
  persist(
    (set, get) => ({
      ...initialPlayerHandState,

      initSession(playerName, numPlayers) {
        const cardsPerPlayer = Math.min(1, Math.floor(40 / numPlayers));
        set({
          playerName,
          numPlayers,
          round: 1,
          cardsPerPlayer,
          manilha: null,
          handCards: [],
          otherPlayedCards: [],
          ...resetCycleFields,
        });
      },

      setManilha(card) {
        set({ manilha: card });
      },

      addHandCard(value, suit) {
        const { handCards } = get();
        const newCard: HandCard = { value, suit, played: false };
        set({ handCards: [...handCards, newCard] });
      },

      removeHandCard(index) {
        const { handCards } = get();
        set({ handCards: handCards.filter((_, i) => i !== index) });
      },

      toggleHandCardPlayed(index) {
        const { handCards, cardsPlayedInCycle, numPlayers, ownCardIndexThisCycle } = get();
        const target = handCards[index];
        if (!target) return;

        const turningOn = !target.played;

        if (turningOn) {
          const cycleFull = cardsPlayedInCycle >= numPlayers;
          const ownSlotTakenByOther =
            ownCardIndexThisCycle !== null && ownCardIndexThisCycle !== index;
          if (cycleFull || ownSlotTakenByOther) return;

          set({
            handCards: handCards.map((c, i) => (i === index ? { ...c, played: true } : c)),
            cardsPlayedInCycle: cardsPlayedInCycle + 1,
            ownCardIndexThisCycle: index,
          });
          return;
        }

        // turning off
        if (ownCardIndexThisCycle === index) {
          set({
            handCards: handCards.map((c, i) => (i === index ? { ...c, played: false } : c)),
            cardsPlayedInCycle: Math.max(0, cardsPlayedInCycle - 1),
            ownCardIndexThisCycle: null,
          });
          return;
        }

        // turning off a card played in a past cycle — do not touch counters
        set({
          handCards: handCards.map((c, i) => (i === index ? { ...c, played: false } : c)),
        });
      },

      addOtherPlayedCard(card) {
        const { otherPlayedCards, cardsPlayedInCycle, numPlayers, otherCardsAddedThisCycle } = get();
        if (cardsPlayedInCycle >= numPlayers) return;
        set({
          otherPlayedCards: [...otherPlayedCards, card],
          cardsPlayedInCycle: cardsPlayedInCycle + 1,
          otherCardsAddedThisCycle: otherCardsAddedThisCycle + 1,
        });
      },

      removeOtherPlayedCard(index) {
        const { otherPlayedCards, cardsPlayedInCycle, otherCardsAddedThisCycle } = get();
        const windowStart = otherPlayedCards.length - otherCardsAddedThisCycle;
        const isCurrentCycleCard = index >= windowStart;
        const next = otherPlayedCards.filter((_, i) => i !== index);
        if (isCurrentCycleCard) {
          set({
            otherPlayedCards: next,
            cardsPlayedInCycle: Math.max(0, cardsPlayedInCycle - 1),
            otherCardsAddedThisCycle: Math.max(0, otherCardsAddedThisCycle - 1),
          });
        } else {
          set({ otherPlayedCards: next });
        }
      },

      clearOtherPlayedCards() {
        const { cardsPlayedInCycle, otherCardsAddedThisCycle } = get();
        set({
          otherPlayedCards: [],
          cardsPlayedInCycle: Math.max(0, cardsPlayedInCycle - otherCardsAddedThisCycle),
          otherCardsAddedThisCycle: 0,
        });
      },

      finishRound() {
        const { round, numPlayers, playerName } = get();
        const newRound = round + 1;
        const newCardsPerPlayer = Math.min(newRound, Math.floor(40 / numPlayers));
        set({
          playerName,
          numPlayers,
          round: newRound,
          cardsPerPlayer: newCardsPerPlayer,
          manilha: null,
          handCards: [],
          otherPlayedCards: [],
          ...resetCycleFields,
        });
      },

      reset() {
        set({ ...initialPlayerHandState });
      },

      updateNumPlayers(n) {
        const { round } = get();
        const clamped = Math.min(10, Math.max(2, n));
        const cardsPerPlayer = Math.min(round, Math.floor(40 / clamped));
        set({ numPlayers: clamped, cardsPerPlayer });
      },

      advanceCycle() {
        const { cardsPlayedInCycle, currentCycle } = get();
        if (cardsPlayedInCycle === 0) return;
        set({
          currentCycle: currentCycle + 1,
          cardsPlayedInCycle: 0,
          ownCardIndexThisCycle: null,
          otherCardsAddedThisCycle: 0,
        });
      },

      previousCycle() {
        const { cardsPlayedInCycle, currentCycle } = get();
        if (cardsPlayedInCycle > 0 || currentCycle <= 1) return;
        set({ currentCycle: currentCycle - 1 });
      },
    }),
    {
      name: 'fodinha-hand',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2 && persistedState && typeof persistedState === 'object') {
          return {
            ...(persistedState as Partial<PlayerHandState>),
            currentCycle: 1,
            cardsPlayedInCycle: 0,
            ownCardIndexThisCycle: null,
            otherCardsAddedThisCycle: 0,
          } as PlayerHandState;
        }
        return persistedState as PlayerHandState;
      },
      partialize: (state) => ({
        playerName: state.playerName,
        numPlayers: state.numPlayers,
        round: state.round,
        cardsPerPlayer: state.cardsPerPlayer,
        manilha: state.manilha,
        handCards: state.handCards,
        otherPlayedCards: state.otherPlayedCards,
        currentCycle: state.currentCycle,
        cardsPlayedInCycle: state.cardsPlayedInCycle,
        ownCardIndexThisCycle: state.ownCardIndexThisCycle,
        otherCardsAddedThisCycle: state.otherCardsAddedThisCycle,
      }),
    }
  )
);

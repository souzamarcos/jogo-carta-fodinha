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
};

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
        const { handCards } = get();
        set({
          handCards: handCards.map((card, i) =>
            i === index ? { ...card, played: !card.played } : card
          ),
        });
      },

      addOtherPlayedCard(card) {
        const { otherPlayedCards } = get();
        set({ otherPlayedCards: [...otherPlayedCards, card] });
      },

      removeOtherPlayedCard(index) {
        const { otherPlayedCards } = get();
        set({ otherPlayedCards: otherPlayedCards.filter((_, i) => i !== index) });
      },

      clearOtherPlayedCards() {
        set({ otherPlayedCards: [] });
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
        });
      },

      reset() {
        set({ ...initialPlayerHandState });
      },
    }),
    {
      name: 'fodinha-hand',
      version: 1,
      partialize: (state) => ({
        playerName: state.playerName,
        numPlayers: state.numPlayers,
        round: state.round,
        cardsPerPlayer: state.cardsPerPlayer,
        manilha: state.manilha,
        handCards: state.handCards,
        otherPlayedCards: state.otherPlayedCards,
      }),
    }
  )
);

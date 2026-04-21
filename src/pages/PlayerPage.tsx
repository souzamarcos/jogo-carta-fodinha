import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerHandStore } from '@/store/playerHandStore';
import { CARD_ORDER } from '@/types';
import type { CardValue, CardSuit } from '@/types';
import { sortHandStrongest } from '@/utils/cardUtils';
import { CardGrid } from '@/components';

const SUIT_EMOJI: Record<CardSuit, string> = {
  ouros: '♦',
  espadas: '♠',
  copas: '♥',
  paus: '♣',
};

// ─── Screen 1: Config ────────────────────────────────────────────────────────

function ConfigScreen() {
  const initSession = usePlayerHandStore(s => s.initSession);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [numPlayers, setNumPlayers] = useState(4);

  function handleStart() {
    const trimmed = name.trim();
    if (!trimmed || numPlayers < 2) return;
    initSession(trimmed, numPlayers);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-2xl"
        >
          ‹
        </button>
        <h1 className="text-2xl font-bold">Painel Individual</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Seu nome</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: João"
            className="w-full min-h-[48px] bg-slate-700 rounded-xl px-4 text-white placeholder-slate-500 border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Número de jogadores</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNumPlayers(n => Math.max(2, n - 1))}
              className="min-h-[44px] min-w-[44px] bg-slate-700 rounded-xl text-xl font-bold hover:bg-slate-600 active:bg-slate-500"
            >
              −
            </button>
            <span className="text-2xl font-mono font-bold w-12 text-center">{numPlayers}</span>
            <button
              onClick={() => setNumPlayers(n => Math.min(10, n + 1))}
              className="min-h-[44px] min-w-[44px] bg-slate-700 rounded-xl text-xl font-bold hover:bg-slate-600 active:bg-slate-500"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim() || numPlayers < 2}
          className="w-full min-h-[52px] bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Iniciar
        </button>
      </div>
    </div>
  );
}

// ─── Screen 2: Etapa 1 — Select Manilha ──────────────────────────────────────

function ManilhaSetupScreen() {
  const { playerName, round, numPlayers } = usePlayerHandStore(s => ({
    playerName: s.playerName,
    round: s.round,
    numPlayers: s.numPlayers,
  }));
  const setManilha = usePlayerHandStore(s => s.setManilha);
  const updateNumPlayers = usePlayerHandStore(s => s.updateNumPlayers);
  const navigate = useNavigate();

  const [selectedValue, setSelectedValue] = useState<CardValue | null>(null);

  function handleConfirm() {
    if (!selectedValue) return;
    setManilha({ value: selectedValue });
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-2xl"
        >
          ‹
        </button>
        <div>
          <h1 className="text-xl font-bold">{playerName}</h1>
          <p className="text-slate-400 text-sm">
            Rodada {round} · {numPlayers} jogadores
          </p>
        </div>
      </div>

      {/* Player count stepper */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-slate-400">Jogadores:</span>
        <button
          onClick={() => updateNumPlayers(numPlayers - 1)}
          disabled={numPlayers <= 2}
          className="min-h-[44px] min-w-[44px] bg-slate-700 rounded-xl text-xl font-bold hover:bg-slate-600 active:bg-slate-500 disabled:opacity-40 disabled:pointer-events-none"
        >
          −
        </button>
        <span className="text-2xl font-mono font-bold w-12 text-center">{numPlayers}</span>
        <button
          onClick={() => updateNumPlayers(numPlayers + 1)}
          disabled={numPlayers >= 10}
          className="min-h-[44px] min-w-[44px] bg-slate-700 rounded-xl text-xl font-bold hover:bg-slate-600 active:bg-slate-500 disabled:opacity-40 disabled:pointer-events-none"
        >
          +
        </button>
      </div>

      <h2 className="text-lg font-semibold mb-3">Qual é a manilha?</h2>

      {/* Value picker */}
      <p className="text-sm text-slate-400 mb-2">Valor da virada:</p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {CARD_ORDER.map(v => (
          <button
            key={v}
            onClick={() => setSelectedValue(v)}
            className={`min-h-[44px] rounded-xl font-bold text-lg transition-colors ${
              selectedValue === v
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedValue}
        className="w-full min-h-[52px] bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        Confirmar Manilha
      </button>
    </div>
  );
}

// ─── Screen 3: Etapa 2 — Build Hand ──────────────────────────────────────────

function HandSetupScreen({ onStartRound }: { onStartRound: () => void }) {
  const { manilha, handCards, cardsPerPlayer, numPlayers, playerName, round } =
    usePlayerHandStore(s => ({
      manilha: s.manilha,
      handCards: s.handCards,
      cardsPerPlayer: s.cardsPerPlayer,
      numPlayers: s.numPlayers,
      playerName: s.playerName,
      round: s.round,
    }));
  const addHandCard = usePlayerHandStore(s => s.addHandCard);
  const removeHandCard = usePlayerHandStore(s => s.removeHandCard);
  const navigate = useNavigate();

  const atLimit = handCards.length >= cardsPerPlayer;

  function handleCardSelect(value: CardValue) {
    if (atLimit) return;
    addHandCard(value);
  }

  function handleManilhaSelect(suit: CardSuit) {
    if (atLimit || !manilha) return;
    addHandCard(manilha.value, suit);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-2xl"
        >
          ‹
        </button>
        <div>
          <h1 className="text-xl font-bold">{playerName}</h1>
          <p className="text-slate-400 text-sm">Rodada {round}</p>
        </div>
      </div>

      {/* Manilha display */}
      <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700 rounded-xl p-3 mb-4">
        <span className="text-amber-400 font-semibold text-sm">Manilha:</span>
        <span className="text-white font-bold">{manilha?.value}</span>
      </div>

      {/* Cards per player info */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-400">
          Cartas por jogador: <span className="font-bold text-white">{cardsPerPlayer}</span>
        </span>
        <span className="text-xs text-slate-500">{numPlayers} jogadores</span>
      </div>

      {/* Hand list */}
      <div className="mb-3">
        <p className="text-sm text-slate-400 mb-2">
          Sua mão ({handCards.length}/{cardsPerPlayer}):
        </p>
        {handCards.length === 0 && (
          <p className="text-slate-600 text-sm italic">Toque uma carta abaixo para adicionar</p>
        )}
        <div className="flex flex-wrap gap-2 mb-2">
          {handCards.map((card, i) => (
            <div key={i} className="flex items-center gap-1 bg-slate-700 rounded-lg px-3 py-1">
              <span className="font-bold">{card.value}</span>
              {card.suit && (
                <span className="text-sm text-slate-300">{SUIT_EMOJI[card.suit]}</span>
              )}
              <button
                onClick={() => removeHandCard(i)}
                className="ml-1 text-slate-400 hover:text-red-400 text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CardGrid — setup mode: disableAtZero=true */}
      <CardGrid
        manilha={manilha}
        handCards={handCards}
        otherPlayed={[]}
        onCardSelect={handleCardSelect}
        onManilhaSuitSelect={handleManilhaSelect}
        disabled={atLimit}
        disableAtZero={true}
      />

      <button
        onClick={onStartRound}
        disabled={handCards.length === 0}
        className="w-full min-h-[52px] mt-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        Iniciar Rodada ({handCards.length} carta{handCards.length !== 1 ? 's' : ''})
      </button>
    </div>
  );
}

// ─── Screen 4: Play Screen ────────────────────────────────────────────────────

function PlayScreen({ onFinishRound }: { onFinishRound: () => void }) {
  const state = usePlayerHandStore(s => s);
  const addOtherPlayedCard = usePlayerHandStore(s => s.addOtherPlayedCard);
  const removeOtherPlayedCard = usePlayerHandStore(s => s.removeOtherPlayedCard);
  const toggleHandCardPlayed = usePlayerHandStore(s => s.toggleHandCardPlayed);
  const finishRound = usePlayerHandStore(s => s.finishRound);
  const advanceCycle = usePlayerHandStore(s => s.advanceCycle);
  const previousCycle = usePlayerHandStore(s => s.previousCycle);
  const navigate = useNavigate();

  const {
    manilha,
    handCards,
    otherPlayedCards,
    numPlayers,
    cardsPerPlayer,
    round,
    playerName,
    currentCycle,
    cardsPlayedInCycle,
    ownCardIndexThisCycle,
    otherCardsAddedThisCycle,
  } = state;

  const totalCards = numPlayers * cardsPerPlayer;
  const playedCount =
    handCards.filter(c => c.played).length + otherPlayedCards.length;
  const remaining = Math.max(0, totalCards - playedCount);
  const limitReached = playedCount >= totalCards;
  const cycleFull = cardsPlayedInCycle >= numPlayers;
  const ownCardPlayedThisCycle = ownCardIndexThisCycle !== null;
  const canAdvanceCycle = cardsPlayedInCycle > 0 && ownCardPlayedThisCycle;
  const canGoPrevious = currentCycle > 1 && cardsPlayedInCycle === 0;
  const addBlocked =
    limitReached ||
    cycleFull ||
    (!ownCardPlayedThisCycle && otherCardsAddedThisCycle >= numPlayers - 1);
  const roundComplete =
    cardsPerPlayer > 0 &&
    handCards.filter(c => c.played).length === cardsPerPlayer &&
    cycleFull;

  // Sorted remaining hand (unplayed, strongest first)
  const unplayedHand = sortHandStrongest(
    handCards.filter(c => !c.played),
    manilha
  );

  function handleBlockACardSelect(value: CardValue) {
    if (addBlocked) return;
    addOtherPlayedCard({ value });
  }

  function handleBlockAManilhaSuit(suit: CardSuit) {
    if (!manilha || addBlocked) return;
    addOtherPlayedCard({ value: manilha.value, suit });
  }

  function handleUnknown() {
    if (addBlocked) return;
    addOtherPlayedCard({ value: 'unknown' });
  }

  function handleFinish() {
    finishRound();
    onFinishRound();
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-2xl"
        >
          ‹
        </button>
        <div className="flex-1">
          <h1 className="font-bold">{playerName}</h1>
          <p className="text-slate-400 text-xs">
            Rodada {round} · {numPlayers} jogadores · {cardsPerPlayer} cartas
          </p>
        </div>
      </div>

      {/* Manilha compact bar */}
      <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700/50 rounded-lg px-3 py-2 mb-3">
        <span className="text-amber-400 text-xs font-semibold">MANILHA</span>
        <span className="text-white font-bold">{manilha?.value}</span>
        <span className="ml-auto text-slate-400 text-xs">
          {remaining}/{totalCards} cartas
        </span>
      </div>

      {/* Cycle indicator */}
      <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-3">
        <span className="text-slate-400 text-xs font-semibold">CICLO</span>
        <span className="text-white text-xl font-mono font-bold">{currentCycle}</span>
        <span className="ml-2 text-slate-300 text-sm font-mono">
          {cardsPlayedInCycle}/{numPlayers}
        </span>
        {roundComplete && (
          <span className="px-2 py-0.5 rounded-md bg-emerald-700/30 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
            Rodada completa
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={previousCycle}
            disabled={!canGoPrevious}
            aria-label="Ciclo anterior"
            className="min-h-[44px] min-w-[44px] px-3 bg-slate-700 rounded-xl font-bold text-sm hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 disabled:pointer-events-none"
          >
            ‹
          </button>
          {!roundComplete && (
            <button
              type="button"
              onClick={advanceCycle}
              disabled={!canAdvanceCycle}
              className="min-h-[44px] px-4 bg-blue-600 rounded-xl font-bold text-sm hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none"
            >
              Próximo Ciclo ›
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-700 rounded-full mb-4">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${totalCards > 0 ? (playedCount / totalCards) * 100 : 0}%` }}
        />
      </div>

      {/* Block A: Other players' cards */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-2">
          Cartas disponíveis (outros jogadores)
        </h2>
        <CardGrid
          manilha={manilha}
          handCards={handCards}
          otherPlayed={otherPlayedCards}
          onCardSelect={handleBlockACardSelect}
          onManilhaSuitSelect={handleBlockAManilhaSuit}
          onUnknown={handleUnknown}
          disabled={addBlocked}
          disableAtZero={false}
          showUnknown={true}
        />

        {/* List of recorded other played cards */}
        {otherPlayedCards.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 mb-1">Cartas registradas:</p>
            <div className="flex flex-wrap gap-1">
              {otherPlayedCards.map((card, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-slate-700 rounded-lg px-2 py-1 text-sm"
                >
                  <span className="font-bold">
                    {card.value === 'unknown' ? '?' : card.value}
                  </span>
                  {card.suit && (
                    <span className="text-slate-300">{SUIT_EMOJI[card.suit]}</span>
                  )}
                  <button
                    onClick={() => removeOtherPlayedCard(i)}
                    className="ml-1 text-slate-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Block B: My hand */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-2">Minha mão</h2>
        <div className="flex flex-wrap gap-2">
          {handCards.map((card, i) => {
            const disabledForCycle =
              !card.played &&
              (cycleFull || (ownCardPlayedThisCycle && ownCardIndexThisCycle !== i));
            return (
              <button
                key={i}
                onClick={() => toggleHandCardPlayed(i)}
                disabled={disabledForCycle}
                className={`min-h-[52px] min-w-[52px] rounded-xl border-2 font-bold text-lg flex flex-col items-center justify-center px-3 transition-colors disabled:opacity-30 disabled:pointer-events-none ${
                  card.played
                    ? 'border-slate-600 bg-slate-800 opacity-40 line-through'
                    : 'border-blue-500 bg-slate-700 hover:bg-slate-600 active:bg-slate-500'
                }`}
              >
                <span>{card.value}</span>
                {card.suit && <span className="text-xs">{SUIT_EMOJI[card.suit]}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analysis: remaining hand sorted strongest-first */}
      {unplayedHand.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">
            Análise (do mais forte)
          </h2>
          <div className="flex flex-wrap gap-2">
            {unplayedHand.map((card, i) => {
              const rank = i + 1;
              const label = rank === 1 ? '1°' : rank === 2 ? '2°' : rank === 3 ? '3°' : `#${rank}`;
              return (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="font-bold">{card.value}</span>
                  {card.suit && (
                    <span className="text-xs">{SUIT_EMOJI[card.suit]}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Finish round button (fixed bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-sm">
        <button
          onClick={handleFinish}
          className="w-full max-w-lg mx-auto block min-h-[52px] bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg transition-colors"
        >
          Finalizar Rodada
        </button>
      </div>
    </div>
  );
}

// ─── Top-level PlayerPage ─────────────────────────────────────────────────────

export default function PlayerPage() {
  const playerName = usePlayerHandStore(s => s.playerName);
  const manilha = usePlayerHandStore(s => s.manilha);
  const handCards = usePlayerHandStore(s => s.handCards);

  // showPlay: true when hand has cards (persists across re-renders via initial state)
  const [showPlay, setShowPlay] = useState(() => handCards.length > 0);

  // If playerName is empty → config screen
  if (!playerName) return <ConfigScreen />;

  // If manilha not set → Etapa 1
  if (!manilha) return <ManilhaSetupScreen />;

  // If not showing play → Etapa 2
  if (!showPlay) return <HandSetupScreen onStartRound={() => setShowPlay(true)} />;

  // Play screen
  return <PlayScreen onFinishRound={() => setShowPlay(false)} />;
}

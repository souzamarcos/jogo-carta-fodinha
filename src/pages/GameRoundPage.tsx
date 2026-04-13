import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import {
  PlayerCard,
  BidInput,
  Timer,
  RoundHistoryTable,
  ConfirmResultModal,
} from '@/components';
import { CARD_ORDER } from '@/types';
import type { CardValue } from '@/types';

export default function GameRoundPage() {
  const navigate = useNavigate();
  const phase = useGameStore(s => s.phase);
  const players = useGameStore(s => s.players);

  useEffect(() => {
    if (players.length === 0) navigate('/');
    if (phase === 'finished') navigate('/game/winner');
  }, [phase, players.length, navigate]);

  if (players.length === 0) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      {phase === 'bid' && <BidPhase />}
      {phase === 'playing' && <PlayingPhase />}
      {phase === 'result' && <ResultPhase />}
      {phase === 'tiebreak' && <TiebreakModal />}
    </div>
  );
}

function BidPhase() {
  const { players, round, currentRound, dealerIndex } = useGameStore(s => ({
    players: s.players,
    round: s.round,
    currentRound: s.currentRound,
    dealerIndex: s.dealerIndex,
  }));
  const setManilha = useGameStore(s => s.setManilha);
  const setBid = useGameStore(s => s.setBid);
  const startRound = useGameStore(s => s.startRound);

  const [manilhaValue, setManilhaValue] = useState<CardValue | null>(
    currentRound?.manilha?.value ?? null
  );

  const navigate = useNavigate();
  const alive = players.filter(p => p.alive).sort((a, b) => a.position - b.position);
  const cardsPerPlayer = currentRound?.cardsPerPlayer ?? 1;

  const ordered = currentRound
    ? [...alive.slice(currentRound.firstBidderIndex), ...alive.slice(0, currentRound.firstBidderIndex)]
    : alive;

  const manilhaConfirmed = manilhaValue !== null;
  const canStart = manilhaConfirmed;

  function handleManilhaValueSelect(v: CardValue) {
    setManilhaValue(v);
    setManilha({ value: v });
  }

  function handleStart() {
    startRound();
  }

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-4 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-2xl"
        >
          ‹
        </button>
        <h1 className="text-2xl font-bold">Rodada {round}</h1>
        <span className="ml-auto text-slate-400 text-sm">
          {cardsPerPlayer} carta{cardsPerPlayer !== 1 ? 's' : ''}/jogador
        </span>
      </div>

      {/* Manilha selector */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-4">
        <h2 className="font-semibold mb-3 text-slate-300">Manilha</h2>
        {manilhaConfirmed ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-amber-400">{manilhaValue}</span>
            <button
              onClick={() => setManilhaValue(null)}
              className="ml-auto text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Alterar
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-2">Qual é a manilha?</p>
            <div className="grid grid-cols-5 gap-2">
              {CARD_ORDER.map(v => (
                <button
                  key={v}
                  onClick={() => handleManilhaValueSelect(v)}
                  className="min-h-[44px] bg-slate-700 hover:bg-slate-600 active:bg-amber-700 rounded-xl font-bold text-lg transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bids */}
      <div className="space-y-2 mb-6">
        <h2 className="font-semibold text-slate-300">Palpites</h2>
        {ordered.map((player, i) => {
          const isDealer = player.id === alive[dealerIndex % alive.length]?.id;
          const isFirst = i === 0;
          const bid = currentRound?.bids[player.id] ?? 0;
          return (
            <PlayerCard
              key={player.id}
              player={player}
              isDealer={isDealer}
              isCurrentBidder={isFirst}
            >
              <BidInput
                value={bid}
                max={cardsPerPlayer}
                onChange={val => setBid(player.id, val)}
              />
            </PlayerCard>
          );
        })}
      </div>

      {/* History */}
      <GameHistory />

      {/* Start button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-sm">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full max-w-lg mx-auto block min-h-[52px] bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Iniciar Rodada
        </button>
      </div>
    </div>
  );
}

function PlayingPhase() {
  const { players, round, currentRound, dealerIndex } = useGameStore(s => ({
    players: s.players,
    round: s.round,
    currentRound: s.currentRound,
    dealerIndex: s.dealerIndex,
  }));
  const endRound = useGameStore(s => s.endRound);
  const setManilha = useGameStore(s => s.setManilha);
  const navigate = useNavigate();

  const [isEditingManilha, setIsEditingManilha] = useState(false);

  const alive = players.filter(p => p.alive).sort((a, b) => a.position - b.position);

  function handleManilhaChange(v: CardValue) {
    setManilha({ value: v });
    setIsEditingManilha(false);
  }

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto min-h-screen pb-24">
      <div className="flex items-center gap-3 mb-4 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-2xl"
        >
          ‹
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Em Jogo · Rodada {round}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {currentRound?.startedAt && <Timer startedAt={currentRound.startedAt} />}
          </div>
        </div>
      </div>

      {/* Manilha display */}
      <div className="bg-amber-900/30 border border-amber-700 rounded-2xl p-4 mb-4">
        {isEditingManilha ? (
          <>
            <p className="text-xs text-amber-400 font-semibold mb-2">ALTERAR MANILHA</p>
            <div className="grid grid-cols-5 gap-2">
              {CARD_ORDER.map(v => (
                <button
                  key={v}
                  onClick={() => handleManilhaChange(v)}
                  className="min-h-[44px] bg-slate-700 hover:bg-slate-600 active:bg-amber-700 rounded-xl font-bold text-lg transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsEditingManilha(false)}
              className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Cancelar
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-amber-400 font-semibold mb-0.5">MANILHA</p>
              <span className="text-3xl font-black text-white">{currentRound?.manilha?.value}</span>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-400">{currentRound?.cardsPerPlayer} cartas/jogador</p>
              <button
                onClick={() => setIsEditingManilha(true)}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Alterar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bids summary */}
      <div className="space-y-2 mb-4">
        <h2 className="font-semibold text-slate-300 text-sm">Palpites</h2>
        {alive.map(player => {
          const isDealer = player.id === alive[dealerIndex % alive.length]?.id;
          const bid = currentRound?.bids[player.id];
          return (
            <PlayerCard key={player.id} player={player} isDealer={isDealer}>
              <span className="text-xl font-mono font-bold text-blue-300">
                {bid !== undefined ? bid : '–'}
              </span>
            </PlayerCard>
          );
        })}
      </div>

      <GameHistory />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-sm">
        <button
          onClick={endRound}
          className="w-full max-w-lg mx-auto block min-h-[52px] bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg transition-colors"
        >
          Finalizar Rodada
        </button>
      </div>
    </div>
  );
}

function ResultPhase() {
  const { players, round, currentRound, dealerIndex } = useGameStore(s => ({
    players: s.players,
    round: s.round,
    currentRound: s.currentRound,
    dealerIndex: s.dealerIndex,
  }));
  const setTricks = useGameStore(s => s.setTricks);
  const confirmResult = useGameStore(s => s.confirmResult);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);

  const alive = players.filter(p => p.alive).sort((a, b) => a.position - b.position);
  const totalTricks = alive.reduce((sum, p) => sum + (currentRound?.tricks[p.id] ?? 0), 0);
  const cardsPerPlayer = currentRound?.cardsPerPlayer ?? 1;
  const tricksMismatch = totalTricks !== cardsPerPlayer;

  return (
    <div className="flex flex-col p-4 max-w-lg mx-auto min-h-screen pb-24">
      <div className="flex items-center gap-3 mb-4 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 text-2xl"
        >
          ‹
        </button>
        <h1 className="text-2xl font-bold">Resultado · Rodada {round}</h1>
      </div>

      {/* Manilha compact */}
      <div className="flex items-center gap-2 bg-amber-900/20 rounded-xl px-3 py-2 mb-4">
        <span className="text-xs text-amber-400">Manilha:</span>
        <span className="font-bold">{currentRound?.manilha?.value}</span>
        <span className="ml-auto text-xs text-slate-400">{cardsPerPlayer} cartas/jogador</span>
      </div>

      <p className="text-sm text-slate-400 mb-3">Quantas vazas cada jogador fez?</p>

      {/* Tricks input */}
      <div className="space-y-2 mb-2">
        {alive.map(player => {
          const isDealer = player.id === alive[dealerIndex % alive.length]?.id;
          const bid = currentRound?.bids[player.id] ?? 0;
          const tricks = currentRound?.tricks[player.id] ?? 0;
          return (
            <PlayerCard key={player.id} player={player} isDealer={isDealer}>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs text-slate-400">palpite: {bid}</span>
                <BidInput
                  value={tricks}
                  max={cardsPerPlayer}
                  onChange={v => setTricks(player.id, v)}
                />
              </div>
            </PlayerCard>
          );
        })}
      </div>

      {/* Total tricks warning */}
      {tricksMismatch && (
        <p className="text-yellow-400 text-xs mb-2">
          ⚠️ Total de vazas ({totalTricks}) ≠ cartas por jogador ({cardsPerPlayer})
        </p>
      )}

      <GameHistory />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-sm">
        <button
          onClick={() => setShowModal(true)}
          disabled={false}
          className="w-full max-w-lg mx-auto block min-h-[52px] bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Confirmar Resultado
        </button>
      </div>

      {showModal && (
        <ConfirmResultModal
          players={players}
          bids={currentRound?.bids ?? {}}
          tricks={currentRound?.tricks ?? {}}
          onConfirm={() => { setShowModal(false); confirmResult(); }}
          onBack={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

function TiebreakModal() {
  const declareTie = useGameStore(s => s.declareTie);
  const startTiebreakRound = useGameStore(s => s.startTiebreakRound);
  const players = useGameStore(s => s.players);

  const tied = players.filter(p => p.lives === 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">⚔️</div>
          <h2 className="text-xl font-bold">Empate!</h2>
          <p className="text-slate-400 text-sm mt-1">
            {tied.map(p => p.name).join(' e ')} foram eliminados simultaneamente.
          </p>
        </div>

        <button
          onClick={startTiebreakRound}
          className="w-full min-h-[52px] bg-orange-600 hover:bg-orange-500 rounded-xl font-bold text-lg transition-colors"
        >
          🔄 Rodada Extra
        </button>

        <button
          onClick={declareTie}
          className="w-full min-h-[48px] border border-slate-600 rounded-xl font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
        >
          🤝 Declarar Empate (co-campeões)
        </button>
      </div>
    </div>
  );
}

function GameHistory() {
  const history = useGameStore(s => s.history);
  const players = useGameStore(s => s.players);
  return <RoundHistoryTable history={history} players={players} />;
}

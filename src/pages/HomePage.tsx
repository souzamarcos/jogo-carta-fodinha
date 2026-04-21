import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { usePlayerHandStore } from '@/store/playerHandStore';
import { useState } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const gamePhase = useGameStore(s => s.phase);
  const gameRound = useGameStore(s => s.round);
  const gamePlayers = useGameStore(s => s.players);
  const resetGame = useGameStore(s => s.resetGame);

  const playerName = usePlayerHandStore(s => s.playerName);
  const handRound = usePlayerHandStore(s => s.round);
  const resetSession = usePlayerHandStore(s => s.reset);

  const hasGameSession = gamePhase !== 'setup' && gamePlayers.length > 0;
  const hasHandSession = playerName !== '';

  const [gameModal, setGameModal] = useState(false);
  const [handModal, setHandModal] = useState(false);

  function handleGamePress() {
    if (hasGameSession) {
      setGameModal(true);
    } else {
      navigate('/game/setup');
    }
  }

  function handleHandPress() {
    if (hasHandSession) {
      setHandModal(true);
    } else {
      navigate('/player');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-black text-white mb-1">🃏 Fodinha</h1>
        <p className="text-slate-400 text-sm">Selecione o modo</p>
      </div>

      {/* Mode 1 */}
      <button
        onClick={handleGamePress}
        className="w-full max-w-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-600
          border border-slate-700 rounded-2xl p-6 text-left transition-colors min-h-[100px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">🎮 Suporte Geral</h2>
            <p className="text-slate-400 text-sm mt-1">Gerencia vidas, palpites e rodadas</p>
          </div>
          {hasGameSession && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full whitespace-nowrap ml-2">
              Rodada {gameRound}
            </span>
          )}
        </div>
      </button>

      {/* Mode 2 */}
      <button
        onClick={handleHandPress}
        className="w-full max-w-sm bg-slate-800 hover:bg-slate-700 active:bg-slate-600
          border border-slate-700 rounded-2xl p-6 text-left transition-colors min-h-[100px]"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">🤚 Painel Individual</h2>
            <p className="text-slate-400 text-sm mt-1">Acompanhe sua própria mão</p>
          </div>
          {hasHandSession && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full whitespace-nowrap ml-2">
              Rodada {handRound}
            </span>
          )}
        </div>
      </button>

      {/* Rules link */}
      <div className="mt-2 text-center">
        <Link
          to="/rules"
          className="text-slate-400 hover:text-white underline text-sm py-3 px-4 inline-block"
        >
          Regras do jogo
        </Link>
      </div>

      {/* Game session modal */}
      {gameModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-3">
            <h3 className="text-lg font-bold">Partida em andamento</h3>
            <p className="text-slate-400 text-sm">
              {gamePlayers.filter(p => p.alive).length} jogadores • Rodada {gameRound}
            </p>
            <button
              onClick={() => { setGameModal(false); navigate('/game/round'); }}
              className="w-full min-h-[48px] bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
            >
              Continuar
            </button>
            <button
              onClick={() => { resetGame(); setGameModal(false); navigate('/game/setup'); }}
              className="w-full min-h-[48px] bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
            >
              Nova Partida
            </button>
            <button
              onClick={() => setGameModal(false)}
              className="w-full min-h-[44px] text-slate-400 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Hand session modal */}
      {handModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-3">
            <h3 className="text-lg font-bold">Sessão em andamento</h3>
            <p className="text-slate-400 text-sm">{playerName} • Rodada {handRound}</p>
            <button
              onClick={() => { setHandModal(false); navigate('/player'); }}
              className="w-full min-h-[48px] bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
            >
              Continuar
            </button>
            <button
              onClick={() => { resetSession(); setHandModal(false); navigate('/player'); }}
              className="w-full min-h-[48px] bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold transition-colors"
            >
              Nova Sessão
            </button>
            <button
              onClick={() => setHandModal(false)}
              className="w-full min-h-[44px] text-slate-400 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

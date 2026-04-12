import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useEffect } from 'react';

export default function WinnerPage() {
  const navigate = useNavigate();
  const { players, history, startedAt, finishedAt } = useGameStore(s => s);
  const rematch = useGameStore(s => s.rematch);
  const resetGame = useGameStore(s => s.resetGame);

  useEffect(() => {
    if (players.length === 0) navigate('/');
  }, [players.length, navigate]);

  if (players.length === 0) return null;

  const maxLives = Math.max(...players.map(p => p.lives));
  const winners = players.filter(p => p.lives === maxLives);

  function formatDuration(ms: number) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s % 60}s`;
  }

  const duration = finishedAt
    ? formatDuration(new Date(finishedAt).getTime() - new Date(startedAt).getTime())
    : '–';

  const isTie = winners.length > 1;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-sm w-full">
        <div className="text-6xl mb-4">{isTie ? '🤝' : '🏆'}</div>

        <h1 className="text-3xl font-black mb-2">
          {isTie ? 'Empate!' : 'Vencedor!'}
        </h1>

        <div className="text-2xl font-bold text-yellow-400 mb-6">
          {winners.map(w => w.name).join(' & ')}
        </div>

        {/* Summary */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Rodadas jogadas</span>
            <span className="font-bold">{history.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Duração</span>
            <span className="font-bold">{duration}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Jogadores</span>
            <span className="font-bold">{players.length}</span>
          </div>
        </div>

        {/* Final standings */}
        <div className="bg-slate-800 rounded-2xl p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 text-left">Classificação final</h2>
          {[...players]
            .sort((a, b) => b.lives - a.lives)
            .map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 py-1.5 border-t border-slate-700 first:border-0"
              >
                <span className="text-sm text-slate-500 w-5">{i + 1}º</span>
                <span
                  className={`flex-1 text-left font-medium ${!p.alive ? 'text-slate-500 line-through' : 'text-white'}`}
                >
                  {p.name}
                </span>
                <span
                  className={`text-sm font-bold ${
                    p.lives > 3
                      ? 'text-green-400'
                      : p.lives >= 2
                      ? 'text-yellow-400'
                      : p.lives >= 1
                      ? 'text-orange-400'
                      : 'text-red-400'
                  }`}
                >
                  {p.lives} vida{p.lives !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { rematch(); navigate('/game/round'); }}
            className="w-full min-h-[52px] bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg transition-colors"
          >
            🔄 Revanche
          </button>
          <button
            onClick={() => { resetGame(); navigate('/'); }}
            className="w-full min-h-[48px] bg-slate-700 hover:bg-slate-600 rounded-xl font-semibold text-slate-300 transition-colors"
          >
            Início
          </button>
        </div>
      </div>
    </div>
  );
}

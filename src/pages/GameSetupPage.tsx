import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';

interface PlayerEntry {
  id: number;
  name: string;
}

export default function GameSetupPage() {
  const navigate = useNavigate();
  const startGame = useGameStore(s => s.startGame);

  const [players, setPlayers] = useState<PlayerEntry[]>([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ]);
  const [nextId, setNextId] = useState(3);
  const [error, setError] = useState<string | null>(null);

  function addPlayer() {
    setPlayers(p => [...p, { id: nextId, name: '' }]);
    setNextId(n => n + 1);
  }

  function removePlayer(id: number) {
    setPlayers(p => p.filter(pl => pl.id !== id));
  }

  function updateName(id: number, name: string) {
    setPlayers(p => p.map(pl => pl.id === id ? { ...pl, name } : pl));
    setError(null);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setPlayers(p => {
      const next = [...p];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    if (index === players.length - 1) return;
    setPlayers(p => {
      const next = [...p];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function handleStart() {
    const trimmed = players.map(p => p.name.trim()).filter(Boolean);
    if (trimmed.length < 2) {
      setError('Adicione pelo menos 2 jogadores com nomes válidos.');
      return;
    }
    const lower = trimmed.map(n => n.toLowerCase());
    const hasDups = lower.some((n, i) => lower.indexOf(n) !== i);
    if (hasDups) {
      setError('Nomes duplicados não são permitidos.');
      return;
    }
    startGame(trimmed.map(name => ({ name })));
    navigate('/game/round');
  }

  const validCount = players.filter(p => p.name.trim()).length;
  const canStart = validCount >= 2;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button
          onClick={() => navigate('/')}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white text-2xl"
        >
          ‹
        </button>
        <h1 className="text-2xl font-bold">Nova Partida</h1>
      </div>

      <p className="text-slate-400 text-sm mb-4">Adicione os jogadores na ordem de posição na mesa.</p>

      <div className="space-y-2 mb-4">
        {players.map((player, index) => (
          <div key={player.id} className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="min-h-[22px] min-w-[22px] text-slate-400 disabled:opacity-20 text-xs leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === players.length - 1}
                className="min-h-[22px] min-w-[22px] text-slate-400 disabled:opacity-20 text-xs leading-none"
              >
                ▼
              </button>
            </div>
            <span className="text-slate-500 text-sm w-5 text-center">{index + 1}</span>
            <input
              type="text"
              value={player.name}
              onChange={e => updateName(player.id, e.target.value)}
              placeholder={`Jogador ${index + 1}`}
              className="flex-1 min-h-[44px] bg-slate-700 rounded-xl px-3 text-white placeholder-slate-500
                border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
            {players.length > 2 && (
              <button
                onClick={() => removePlayer(player.id)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400
                  hover:text-red-400 text-xl transition-colors"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3">{error}</p>
      )}

      <button
        onClick={addPlayer}
        className="w-full min-h-[44px] border border-dashed border-slate-600 rounded-xl
          text-slate-400 hover:text-white hover:border-slate-400 transition-colors mb-6"
      >
        + Adicionar jogador
      </button>

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full min-h-[52px] bg-green-600 hover:bg-green-500 active:bg-green-700
          disabled:opacity-40 disabled:pointer-events-none rounded-xl text-white font-bold
          text-lg transition-colors"
      >
        Começar Partida
      </button>
    </div>
  );
}

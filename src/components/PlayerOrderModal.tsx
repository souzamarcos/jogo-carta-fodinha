import { useState } from 'react';
import type { Player } from '@/types';

interface PlayerOrderModalProps {
  players: Player[]; // alive players in current order
  onConfirm: (orderedIds: string[]) => void;
  onCancel: () => void;
}

export function PlayerOrderModal({ players, onConfirm, onCancel }: PlayerOrderModalProps) {
  const [order, setOrder] = useState<string[]>(players.map(p => p.id));

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...order];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setOrder(next);
  }

  function moveDown(i: number) {
    if (i === order.length - 1) return;
    const next = [...order];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setOrder(next);
  }

  const playerMap = Object.fromEntries(players.map(p => [p.id, p]));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h2 className="font-bold text-lg">Editar ordem dos jogadores</h2>

        <div className="space-y-2">
          {order.map((id, i) => {
            const player = playerMap[id];
            if (!player) return null;
            return (
              <div
                key={id}
                className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2"
              >
                <span className="flex-1 font-medium">{player.name}</span>
                <button
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  aria-label={`Mover ${player.name} para cima`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(i)}
                  disabled={i === order.length - 1}
                  aria-label={`Mover ${player.name} para baixo`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  ▼
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onConfirm(order)}
          className="w-full min-h-[48px] bg-blue-700 hover:bg-blue-600 rounded-xl font-bold transition-colors"
        >
          Confirmar
        </button>
        <button
          onClick={onCancel}
          className="w-full min-h-[44px] border border-slate-600 rounded-xl font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

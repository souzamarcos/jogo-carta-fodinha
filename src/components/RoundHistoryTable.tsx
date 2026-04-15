import { useState } from 'react';
import type { RoundHistory, Player } from '@/types';

interface RoundHistoryTableProps {
  history: RoundHistory[];
  players: Player[];
}

export function RoundHistoryTable({ history, players }: RoundHistoryTableProps) {
  const [expanded, setExpanded] = useState(false);
  const sortedPlayers = [...players].sort((a, b) => a.position - b.position);

  if (history.length === 0) return null;

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-xl min-h-[44px] text-left"
      >
        <span className="font-semibold text-slate-300">Histórico ({history.length} rodadas)</span>
        <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="px-2 py-1">Rodada</th>
                <th className="px-2 py-1">Manilha</th>
                <th className="px-2 py-1">Cartas</th>
                {sortedPlayers.map(p => (
                  <th key={p.id} className="px-2 py-1 truncate max-w-[80px]">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.round} className="border-t border-slate-700">
                  <td className="px-2 py-1">{h.round}</td>
                  <td className="px-2 py-1">
                    {h.manilha.value}
                  </td>
                  <td className="px-2 py-1">{h.cardsPerPlayer}</td>
                  {sortedPlayers.map(p => (
                    <td key={p.id} className="px-2 py-1 text-center">
                      {p.id in h.losses ? (
                        <span>
                          <span className="text-slate-400">{h.bids[p.id] ?? 0}/</span>
                          <span>{h.tricks[p.id] ?? 0}</span>
                          {h.losses[p.id] > 0 && (
                            <span className="text-red-400 text-xs"> -{h.losses[p.id]}</span>
                          )}
                        </span>
                      ) : '–'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

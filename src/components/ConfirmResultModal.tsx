import type { Player } from '@/types';

interface ConfirmResultModalProps {
  players: Player[];
  bids: Record<string, number>;
  tricks: Record<string, number>;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmResultModal({ players, bids, tricks, onConfirm, onBack }: ConfirmResultModalProps) {
  const alivePlayers = players.filter(p => p.alive);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-5 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Confirmar Resultado</h2>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase">
              <tr>
                <th className="text-left pb-2">Jogador</th>
                <th className="text-center pb-2">Palpite</th>
                <th className="text-center pb-2">Fez</th>
                <th className="text-center pb-2">Dif.</th>
                <th className="text-center pb-2">Vidas −</th>
              </tr>
            </thead>
            <tbody>
              {alivePlayers.map(p => {
                const bid = bids[p.id] ?? 0;
                const got = tricks[p.id] ?? 0;
                const diff = Math.abs(bid - got);
                return (
                  <tr key={p.id} className="border-t border-slate-700">
                    <td className="py-2 font-medium truncate max-w-[100px]">{p.name}</td>
                    <td className="py-2 text-center">{bid}</td>
                    <td className="py-2 text-center">{got}</td>
                    <td className="py-2 text-center">{diff}</td>
                    <td className={`py-2 text-center font-bold ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {diff > 0 ? `-${diff}` : '✓'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 min-h-[48px] rounded-xl border border-slate-600 text-slate-300 font-semibold
              hover:bg-slate-700 active:bg-slate-600 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[48px] rounded-xl bg-green-600 hover:bg-green-500 active:bg-green-700
              text-white font-bold transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

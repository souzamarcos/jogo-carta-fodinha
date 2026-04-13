import { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import type { Player } from '@/types';

interface DealerSelectionStepProps {
  players: Player[]; // alive players in registration order
  dealerIndex: number; // index into players array
  onConfirm: (overrideDealerIndex?: number) => void;
}

export function DealerSelectionStep({ players, dealerIndex, onConfirm }: DealerSelectionStepProps) {
  const [selectedIndex, setSelectedIndex] = useState(dealerIndex);
  const firstBidderIndex = players.length > 0 ? (selectedIndex + 1) % players.length : 0;

  function handleConfirm() {
    if (selectedIndex !== dealerIndex) {
      onConfirm(selectedIndex);
    } else {
      onConfirm();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-slate-300">Quem distribui as cartas?</h2>
        <span className="text-xs text-slate-500">Toque para alterar</span>
      </div>

      {players.map((player, i) => {
        const isDealer = i === selectedIndex;
        const isFirstBidder = i === firstBidderIndex && players.length > 1;

        return (
          <button
            key={player.id}
            onClick={() => setSelectedIndex(i)}
            className={[
              'w-full text-left rounded-xl transition-colors',
              isDealer ? 'ring-2 ring-blue-500' : '',
            ].join(' ')}
          >
            <PlayerCard
              player={player}
              isDealer={isDealer}
              isFirstBidder={isFirstBidder}
            />
          </button>
        );
      })}

      <div className="pt-2">
        <button
          onClick={handleConfirm}
          className="w-full min-h-[48px] bg-blue-700 hover:bg-blue-600 rounded-xl font-bold transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

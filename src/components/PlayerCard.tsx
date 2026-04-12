import { LivesIndicator } from './LivesIndicator';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  isDealer?: boolean;
  isCurrentBidder?: boolean;
  children?: React.ReactNode;
}

export function PlayerCard({ player, isDealer, isCurrentBidder, children }: PlayerCardProps) {
  return (
    <div
      className={[
        'relative flex items-center gap-3 p-3 rounded-xl border',
        player.alive ? 'bg-slate-800 border-slate-700' : 'bg-slate-900 border-slate-800 opacity-60',
        isCurrentBidder ? 'border-yellow-400 bg-slate-700' : '',
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold truncate ${player.alive ? 'text-white' : 'text-slate-500 line-through'}`}
          >
            {player.name}
          </span>
          {isDealer && (
            <span className="text-xs bg-blue-600 text-white px-1 rounded">D</span>
          )}
        </div>
        <LivesIndicator lives={player.lives} alive={player.alive} />
      </div>
      {children}
    </div>
  );
}

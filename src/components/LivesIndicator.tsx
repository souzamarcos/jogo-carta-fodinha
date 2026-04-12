interface LivesIndicatorProps {
  lives: number;
  alive?: boolean;
}

export function LivesIndicator({ lives, alive = true }: LivesIndicatorProps) {
  let colorClass: string;
  if (!alive || lives <= 0) {
    colorClass = 'bg-gray-500';
  } else if (lives > 3) {
    colorClass = 'bg-green-500';
  } else if (lives === 3) {
    colorClass = 'bg-yellow-400';
  } else {
    colorClass = 'bg-red-500';
  }

  return (
    <div className="flex items-center gap-1">
      <span className={`inline-block w-3 h-3 rounded-full ${colorClass}`} />
      <span className="text-sm font-mono">{lives}</span>
    </div>
  );
}

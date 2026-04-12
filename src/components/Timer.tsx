import { useState, useEffect } from 'react';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

interface TimerProps {
  startedAt: string; // ISO 8601
}

export function Timer({ startedAt }: TimerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - new Date(startedAt).getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <span className="font-mono text-slate-300 text-lg">
      {formatDuration(elapsed)}
    </span>
  );
}

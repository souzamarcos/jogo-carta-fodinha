interface BidInputProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
}

export function BidInput({ value, min = 0, max, onChange, label }: BidInputProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-slate-400">{label}</span>}
      <div className="flex items-center bg-slate-700 rounded-lg overflow-hidden">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xl font-bold
            hover:bg-slate-600 active:bg-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          −
        </button>
        <span className="min-w-[2.5rem] text-center text-xl font-mono font-bold select-none">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xl font-bold
            hover:bg-slate-600 active:bg-slate-500 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

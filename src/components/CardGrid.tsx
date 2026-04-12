import { CARD_ORDER, SUIT_ORDER } from '@/types';
import type { CardValue, CardSuit, Card, HandCard, OtherPlayedCard } from '@/types';
import { countRemainingNonManilha, countRemainingManilhaSuit } from '@/utils/cardUtils';

interface CardGridProps {
  manilha: Card | null;
  handCards: HandCard[];
  otherPlayed: OtherPlayedCard[];
  onCardSelect: (value: CardValue) => void;
  onManilhaSuitSelect: (suit: CardSuit) => void;
  onUnknown?: () => void;
  disabled?: boolean;
  disableAtZero?: boolean;
  showUnknown?: boolean;
  showBadges?: boolean;
}

const SUIT_LABELS: Record<CardSuit, string> = {
  ouros: '♦ Ouros',
  espadas: '♠ Espadas',
  copas: '♥ Copas',
  paus: '♣ Paus',
};

export function CardGrid({
  manilha,
  handCards,
  otherPlayed,
  onCardSelect,
  onManilhaSuitSelect,
  onUnknown,
  disabled = false,
  disableAtZero = false,
  showUnknown = false,
  showBadges = true,
}: CardGridProps) {
  const nonManilhaValues = CARD_ORDER.filter(v => v !== manilha?.value);

  return (
    <div className="space-y-2">
      {/* Value buttons */}
      <div className="grid grid-cols-5 gap-2">
        {nonManilhaValues.map(value => {
          const count = countRemainingNonManilha(value, handCards, otherPlayed);
          const isZero = count === 0;
          const isDisabled = disabled || (disableAtZero && isZero);
          return (
            <button
              key={value}
              onClick={() => !isDisabled && onCardSelect(value)}
              className={[
                'relative min-h-[44px] rounded-lg font-bold text-lg flex items-center justify-center',
                'bg-slate-700 hover:bg-slate-600 active:bg-slate-500 transition-colors',
                isDisabled ? 'opacity-40 pointer-events-none' : '',
                isZero && !isDisabled && !disableAtZero ? 'opacity-40' : '',
              ].join(' ')}
            >
              {value}
              {showBadges && (
                <span
                  className={[
                    'absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5',
                    'flex items-center justify-center text-white',
                    count === 0 ? 'bg-gray-500' : count === 1 ? 'bg-red-500' : 'bg-blue-500',
                  ].join(' ')}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {/* Unknown button */}
        {showUnknown && (
          <button
            onClick={() => !disabled && onUnknown?.()}
            disabled={disabled}
            className={[
              'min-h-[44px] rounded-lg font-bold text-lg flex items-center justify-center',
              'bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors',
              disabled ? 'opacity-40 pointer-events-none' : '',
            ].join(' ')}
          >
            ?
          </button>
        )}
      </div>

      {/* Manilha suit buttons */}
      <div>
        <p className="text-xs text-slate-400 mb-1">
          {manilha ? `Manilha (${manilha.value})` : 'Manilha'}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {SUIT_ORDER.map(suit => {
            const count = manilha
              ? countRemainingManilhaSuit(suit, manilha.value, handCards, otherPlayed)
              : 1;
            const isZero = count === 0;
            const isDisabled = disabled || (disableAtZero && isZero);
            return (
              <button
                key={suit}
                onClick={() => !isDisabled && onManilhaSuitSelect(suit)}
                className={[
                  'relative min-h-[44px] rounded-lg text-sm font-semibold flex items-center justify-center',
                  'bg-amber-700 hover:bg-amber-600 active:bg-amber-500 transition-colors',
                  isDisabled ? 'opacity-40 pointer-events-none' : '',
                  isZero && !isDisabled && !disableAtZero ? 'opacity-40' : '',
                ].join(' ')}
              >
                {SUIT_LABELS[suit]}
                {showBadges && (
                  <span
                    className={[
                      'absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5',
                      'flex items-center justify-center',
                      count === 0 ? 'bg-gray-500 text-white' : 'bg-amber-400 text-black',
                    ].join(' ')}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

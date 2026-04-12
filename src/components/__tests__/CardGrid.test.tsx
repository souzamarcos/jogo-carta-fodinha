import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardGrid } from '../CardGrid';
import type { Card, HandCard, OtherPlayedCard } from '@/types';

const manilha: Card = { value: '7', suit: 'copas' };
const emptyHandCards: HandCard[] = [];
const emptyOtherPlayed: OtherPlayedCard[] = [];

describe('CardGrid', () => {
  it('renders 9 non-manilha value buttons when manilha is set', () => {
    const onCardSelect = vi.fn();
    const onManilhaSuitSelect = vi.fn();
    render(
      <CardGrid
        manilha={manilha}
        handCards={emptyHandCards}
        otherPlayed={emptyOtherPlayed}
        onCardSelect={onCardSelect}
        onManilhaSuitSelect={onManilhaSuitSelect}
      />
    );
    // Non-manilha values: 4, 5, 6, Q, J, K, A, 2, 3 (7 is manilha)
    // Suit buttons: paus, copas, espadas, ouros
    // Total buttons = 9 value + 4 suit = 13
    const buttons = screen.getAllByRole('button');
    // Suit buttons contain suit symbols; filter value buttons
    const suitTexts = ['♣ Paus', '♥ Copas', '♠ Espadas', '♦ Ouros'];
    const valueButtons = buttons.filter(b => {
      const text = b.textContent ?? '';
      return !suitTexts.some(s => text.includes(s));
    });
    expect(valueButtons).toHaveLength(9);
  });

  it('renders 4 suit buttons', () => {
    const onCardSelect = vi.fn();
    const onManilhaSuitSelect = vi.fn();
    render(
      <CardGrid
        manilha={manilha}
        handCards={emptyHandCards}
        otherPlayed={emptyOtherPlayed}
        onCardSelect={onCardSelect}
        onManilhaSuitSelect={onManilhaSuitSelect}
      />
    );
    expect(screen.getByText(/♣ Paus/)).toBeInTheDocument();
    expect(screen.getByText(/♥ Copas/)).toBeInTheDocument();
    expect(screen.getByText(/♠ Espadas/)).toBeInTheDocument();
    expect(screen.getByText(/♦ Ouros/)).toBeInTheDocument();
  });

  it('calls onCardSelect when value button is tapped', () => {
    const onCardSelect = vi.fn();
    const onManilhaSuitSelect = vi.fn();
    render(
      <CardGrid
        manilha={manilha}
        handCards={emptyHandCards}
        otherPlayed={emptyOtherPlayed}
        onCardSelect={onCardSelect}
        onManilhaSuitSelect={onManilhaSuitSelect}
      />
    );
    // Find button whose direct text content starts with 'Q' (which has no ambiguous badge)
    const buttons = screen.getAllByRole('button');
    const qButton = buttons.find(b => b.textContent?.trim().startsWith('Q'));
    expect(qButton).toBeDefined();
    fireEvent.click(qButton!);
    expect(onCardSelect).toHaveBeenCalledWith('Q');
  });

  it('calls onManilhaSuitSelect when suit button is tapped', () => {
    const onCardSelect = vi.fn();
    const onManilhaSuitSelect = vi.fn();
    render(
      <CardGrid
        manilha={manilha}
        handCards={emptyHandCards}
        otherPlayed={emptyOtherPlayed}
        onCardSelect={onCardSelect}
        onManilhaSuitSelect={onManilhaSuitSelect}
      />
    );
    fireEvent.click(screen.getByText(/♣ Paus/));
    expect(onManilhaSuitSelect).toHaveBeenCalledWith('paus');
  });

  it('badge-0 buttons have pointer-events-none class when disableAtZero=true', () => {
    const onCardSelect = vi.fn();
    const onManilhaSuitSelect = vi.fn();
    // All 4 copies of 'Q' are played by others
    const otherPlayed: OtherPlayedCard[] = [
      { value: 'Q' },
      { value: 'Q' },
      { value: 'Q' },
      { value: 'Q' },
    ];
    render(
      <CardGrid
        manilha={manilha}
        handCards={emptyHandCards}
        otherPlayed={otherPlayed}
        onCardSelect={onCardSelect}
        onManilhaSuitSelect={onManilhaSuitSelect}
        disableAtZero={true}
      />
    );
    const buttons = screen.getAllByRole('button');
    const qButton = buttons.find(b => b.textContent?.trim().startsWith('Q'));
    expect(qButton).toBeDefined();
    // Should have pointer-events-none and opacity-40 classes
    expect(qButton!.className).toContain('pointer-events-none');
    expect(qButton!.className).toContain('opacity-40');
  });

  it('badge-0 buttons do NOT have pointer-events-none when disableAtZero=false', () => {
    const onCardSelect = vi.fn();
    const onManilhaSuitSelect = vi.fn();
    const otherPlayed: OtherPlayedCard[] = [
      { value: 'Q' },
      { value: 'Q' },
      { value: 'Q' },
      { value: 'Q' },
    ];
    render(
      <CardGrid
        manilha={manilha}
        handCards={emptyHandCards}
        otherPlayed={otherPlayed}
        onCardSelect={onCardSelect}
        onManilhaSuitSelect={onManilhaSuitSelect}
        disableAtZero={false}
      />
    );
    const buttons = screen.getAllByRole('button');
    const qButton = buttons.find(b => b.textContent?.trim().startsWith('Q'));
    expect(qButton).toBeDefined();
    // Should NOT have pointer-events-none
    expect(qButton!.className).not.toContain('pointer-events-none');
  });
});

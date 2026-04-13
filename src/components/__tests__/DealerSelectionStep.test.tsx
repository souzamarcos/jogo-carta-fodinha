import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DealerSelectionStep } from '../DealerSelectionStep';
import type { Player } from '@/types';

const players: Player[] = [
  { id: 'a', name: 'Alice', position: 0, lives: 5, alive: true },
  { id: 'b', name: 'Bob', position: 1, lives: 5, alive: true },
  { id: 'c', name: 'Charlie', position: 2, lives: 5, alive: true },
];

describe('DealerSelectionStep', () => {
  it('renders all player names', () => {
    render(<DealerSelectionStep players={players} dealerIndex={0} onConfirm={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('shows "Distribui" badge on pre-selected dealer', () => {
    render(<DealerSelectionStep players={players} dealerIndex={0} onConfirm={vi.fn()} />);
    expect(screen.getByText('Distribui')).toBeInTheDocument();
  });

  it('shows "Primeiro palpite" badge on next player after dealer', () => {
    render(<DealerSelectionStep players={players} dealerIndex={0} onConfirm={vi.fn()} />);
    expect(screen.getByText('Primeiro palpite')).toBeInTheDocument();
  });

  it('shows "Toque para alterar" hint', () => {
    render(<DealerSelectionStep players={players} dealerIndex={0} onConfirm={vi.fn()} />);
    expect(screen.getByText('Toque para alterar')).toBeInTheDocument();
  });

  it('calls onConfirm with no arguments when pre-selected dealer is kept', () => {
    const onConfirm = vi.fn();
    render(<DealerSelectionStep players={players} dealerIndex={1} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledWith();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('clicking a different player updates dealer badge in real time', () => {
    render(<DealerSelectionStep players={players} dealerIndex={0} onConfirm={vi.fn()} />);
    // Click Charlie's row
    fireEvent.click(screen.getByText('Charlie').closest('button')!);
    // Distribui should now be on Charlie, Primeiro palpite on Alice (wrap)
    expect(screen.getByText('Distribui')).toBeInTheDocument();
    expect(screen.getByText('Primeiro palpite')).toBeInTheDocument();
  });

  it('calls onConfirm with override index when a different dealer is selected', () => {
    const onConfirm = vi.fn();
    render(<DealerSelectionStep players={players} dealerIndex={0} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Charlie').closest('button')!);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledWith(2);
  });
});

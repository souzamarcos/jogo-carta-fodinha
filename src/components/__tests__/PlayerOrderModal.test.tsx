import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlayerOrderModal } from '../PlayerOrderModal';
import type { Player } from '@/types';

const players: Player[] = [
  { id: 'a', name: 'Alice', position: 0, lives: 5, alive: true },
  { id: 'b', name: 'Bob', position: 1, lives: 5, alive: true },
  { id: 'c', name: 'Charlie', position: 2, lives: 5, alive: true },
];

describe('PlayerOrderModal', () => {
  it('renders all alive players in current order', () => {
    render(<PlayerOrderModal players={players} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('up button is disabled on first row', () => {
    render(<PlayerOrderModal players={players} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const upButtons = screen.getAllByRole('button', { name: /Mover .* para cima/ });
    expect(upButtons[0]).toBeDisabled();
    expect(upButtons[1]).not.toBeDisabled();
    expect(upButtons[2]).not.toBeDisabled();
  });

  it('down button is disabled on last row', () => {
    render(<PlayerOrderModal players={players} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    const downButtons = screen.getAllByRole('button', { name: /Mover .* para baixo/ });
    expect(downButtons[0]).not.toBeDisabled();
    expect(downButtons[1]).not.toBeDisabled();
    expect(downButtons[2]).toBeDisabled();
  });

  it('clicking up moves player one position earlier', () => {
    render(<PlayerOrderModal players={players} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    // Click "Mover Bob para cima" (index 1)
    const bobUpButton = screen.getByRole('button', { name: 'Mover Bob para cima' });
    fireEvent.click(bobUpButton);
    // Bob should now be before Alice — verify by checking the down button of Alice is no longer disabled at position 2
    const onConfirm = vi.fn();
    // Re-render to check confirm is called with Bob first
    const { unmount } = render(
      <PlayerOrderModal players={players} onConfirm={onConfirm} onCancel={vi.fn()} />
    );
    const bobUp = screen.getAllByRole('button', { name: 'Mover Bob para cima' })[1];
    fireEvent.click(bobUp);
    const confirmButtons = screen.getAllByText('Confirmar');
    fireEvent.click(confirmButtons[1]);
    expect(onConfirm).toHaveBeenCalledWith(['b', 'a', 'c']);
    unmount();
  });

  it('clicking down moves player one position later', () => {
    const onConfirm = vi.fn();
    render(<PlayerOrderModal players={players} onConfirm={onConfirm} onCancel={vi.fn()} />);
    // Click "Mover Alice para baixo"
    fireEvent.click(screen.getByRole('button', { name: 'Mover Alice para baixo' }));
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledWith(['b', 'a', 'c']);
  });

  it('clicking Confirm calls onConfirm with new ordered IDs', () => {
    const onConfirm = vi.fn();
    render(<PlayerOrderModal players={players} onConfirm={onConfirm} onCancel={vi.fn()} />);
    // Move Alice down twice → [Bob, Charlie, Alice]
    fireEvent.click(screen.getByRole('button', { name: 'Mover Alice para baixo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mover Alice para baixo' }));
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledWith(['b', 'c', 'a']);
  });

  it('clicking Cancel calls onCancel without changing order', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<PlayerOrderModal players={players} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mover Alice para baixo' }));
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlayerCard } from '../PlayerCard';
import type { Player } from '@/types';

const player: Player = {
  id: 'p1',
  name: 'Alice',
  position: 0,
  lives: 5,
  alive: true,
};

describe('PlayerCard - dealer and first-bidder labels', () => {
  it('renders "Distribui" label when isDealer=true', () => {
    render(<PlayerCard player={player} isDealer={true} />);
    expect(screen.getByText('Distribui')).toBeInTheDocument();
  });

  it('renders "Primeiro palpite" label when isFirstBidder=true', () => {
    render(<PlayerCard player={player} isFirstBidder={true} />);
    expect(screen.getByText('Primeiro palpite')).toBeInTheDocument();
  });

  it('renders both labels when both props are true', () => {
    render(<PlayerCard player={player} isDealer={true} isFirstBidder={true} />);
    expect(screen.getByText('Distribui')).toBeInTheDocument();
    expect(screen.getByText('Primeiro palpite')).toBeInTheDocument();
  });

  it('renders no dealer label when isDealer is false', () => {
    render(<PlayerCard player={player} isDealer={false} />);
    expect(screen.queryByText('Distribui')).not.toBeInTheDocument();
  });

  it('renders no first-bidder label when isFirstBidder is false', () => {
    render(<PlayerCard player={player} isFirstBidder={false} />);
    expect(screen.queryByText('Primeiro palpite')).not.toBeInTheDocument();
  });

  it('renders no labels when both props are absent', () => {
    render(<PlayerCard player={player} />);
    expect(screen.queryByText('Distribui')).not.toBeInTheDocument();
    expect(screen.queryByText('Primeiro palpite')).not.toBeInTheDocument();
  });

  it('renders player name', () => {
    render(<PlayerCard player={player} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});

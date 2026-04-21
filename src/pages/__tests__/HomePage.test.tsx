import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { useGameStore, initialGameState } from '@/store/gameStore';
import { usePlayerHandStore } from '@/store/playerHandStore';

beforeEach(() => {
  useGameStore.setState(initialGameState);
  usePlayerHandStore.setState({ playerName: '', round: 1, numPlayers: 4, cardsPerPlayer: 1, manilha: null, handCards: [], otherPlayedCards: [] });
  localStorage.clear();
});

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage — Regras do jogo link', () => {
  it('renders "Regras do jogo" link', () => {
    renderHomePage();
    expect(screen.getByText(/Regras do jogo/i)).toBeInTheDocument();
  });

  it('"Regras do jogo" link has href /rules', () => {
    renderHomePage();
    const link = screen.getByRole('link', { name: /Regras do jogo/i });
    expect(link).toHaveAttribute('href', '/rules');
  });

  it('renders mode buttons alongside the rules link', () => {
    renderHomePage();
    expect(screen.getByText(/Suporte Geral/i)).toBeInTheDocument();
    expect(screen.getByText(/Painel Individual/i)).toBeInTheDocument();
    expect(screen.getByText(/Regras do jogo/i)).toBeInTheDocument();
  });
});

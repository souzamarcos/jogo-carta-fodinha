import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GameRoundPage from '../GameRoundPage';
import { useGameStore, initialGameState } from '@/store/gameStore';
import type { GameState } from '@/types';

const alice = { id: 'alice', name: 'Alice', position: 0, lives: 5, alive: true };
const bob = { id: 'bob', name: 'Bob', position: 1, lives: 5, alive: true };

function makeRound(overrides = {}) {
  return {
    manilha: { value: '7' as const },
    cardsPerPlayer: 1,
    bids: { alice: 1, bob: 0 },
    tricks: { alice: 1, bob: 0 },
    startedAt: new Date().toISOString(),
    firstBidderIndex: 1,
    bidSubPhase: 'bids' as const,
    ...overrides,
  };
}

function renderPage(stateOverrides: Partial<GameState>) {
  useGameStore.setState({
    ...initialGameState,
    startedAt: new Date().toISOString(),
    players: [alice, bob],
    round: 1,
    dealerIndex: 0,
    ...stateOverrides,
  });
  return render(
    <MemoryRouter initialEntries={['/game/round']}>
      <GameRoundPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useGameStore.setState({ ...initialGameState, startedAt: new Date().toISOString() });
  localStorage.clear();
});

// ─── PlayingPhase — dealer labels ──────────────────────────────────────────────

describe('PlayingPhase — dealer labels', () => {
  it('shows "Distribui" on dealer (Alice) in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    expect(screen.getByText('Distribui')).toBeInTheDocument();
  });

  it('shows "Primeiro palpite" on first bidder (Bob) in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    expect(screen.getByText('Primeiro palpite')).toBeInTheDocument();
  });

  it('"Distribui" is in Alice\'s card in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    const aliceCard = screen.getByText('Alice').closest('.rounded-xl') as HTMLElement;
    expect(aliceCard).toContainElement(screen.getByText('Distribui'));
  });

  it('"Primeiro palpite" is in Bob\'s card in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    const bobCard = screen.getByText('Bob').closest('.rounded-xl') as HTMLElement;
    expect(bobCard).toContainElement(screen.getByText('Primeiro palpite'));
  });

  it('does not show "Primeiro palpite" when only one player is alive', () => {
    useGameStore.setState({
      ...initialGameState,
      startedAt: new Date().toISOString(),
      players: [alice, { ...bob, alive: false, lives: 0 }],
      round: 1,
      dealerIndex: 0,
      phase: 'playing',
      currentRound: makeRound({ bids: { alice: 1 }, tricks: { alice: 1 } }),
    });
    render(
      <MemoryRouter initialEntries={['/game/round']}>
        <GameRoundPage />
      </MemoryRouter>
    );
    expect(screen.queryByText('Primeiro palpite')).not.toBeInTheDocument();
  });
});

// ─── PlayingPhase — tricks inputs ──────────────────────────────────────────────

describe('PlayingPhase — tricks inputs', () => {
  it('renders a tricks BidInput for each alive player in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    // Each player row should have a bid label visible
    expect(screen.getByText('palpite: 1')).toBeInTheDocument(); // Alice
    expect(screen.getByText('palpite: 0')).toBeInTheDocument(); // Bob
  });

  it('shows "Finalizar Rodada" button in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    expect(screen.getByText('Finalizar Rodada')).toBeInTheDocument();
  });

  it('shows warning but still opens modal when tricks total does not equal cardsPerPlayer', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound({ tricks: { alice: 0, bob: 0 } }),
    });
    fireEvent.click(screen.getByText('Finalizar Rodada'));
    expect(screen.getByText(/Total de vazas/)).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('shows confirmation modal when tricks total matches cardsPerPlayer', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound({ tricks: { alice: 1, bob: 0 } }),
    });
    fireEvent.click(screen.getByText('Finalizar Rodada'));
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('calls confirmResult after confirming the modal', () => {
    const confirmResult = vi.fn();
    vi.spyOn(useGameStore.getState(), 'confirmResult').mockImplementation(confirmResult);
    renderPage({
      phase: 'playing',
      currentRound: makeRound({ tricks: { alice: 1, bob: 0 } }),
    });
    fireEvent.click(screen.getByText('Finalizar Rodada'));
    fireEvent.click(screen.getByText('Confirmar'));
    expect(confirmResult).toHaveBeenCalled();
  });
});

// ─── BidPhase — edit dealer button ────────────────────────────────────────────

describe('BidPhase — edit dealer button', () => {
  it('shows "Editar distribuidor" button in round 2 bids sub-phase', () => {
    renderPage({
      phase: 'bid',
      round: 2,
      currentRound: makeRound(),
    });
    expect(screen.getByText('Editar distribuidor')).toBeInTheDocument();
  });

  it('does not show "Editar distribuidor" button in round 1 bids sub-phase', () => {
    renderPage({
      phase: 'bid',
      round: 1,
      currentRound: makeRound(),
    });
    expect(screen.queryByText('Editar distribuidor')).not.toBeInTheDocument();
  });
});

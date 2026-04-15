import { render, screen, fireEvent, within } from '@testing-library/react';
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
    // Text is split across a text node ("palpite: ") and <strong>, so use function matcher
    const labels = screen.getAllByText((_, el) => !!(el?.className?.includes('text-slate-400') && el?.textContent?.startsWith('palpite:')));
    expect(labels.some(el => el.textContent === 'palpite: 1')).toBe(true); // Alice
    expect(labels.some(el => el.textContent === 'palpite: 0')).toBe(true); // Bob
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

  it('shows "Editar distribuidor" button in round 1 bids sub-phase', () => {
    renderPage({
      phase: 'bid',
      round: 1,
      currentRound: makeRound(),
    });
    expect(screen.getByText('Editar distribuidor')).toBeInTheDocument();
  });
});

// ─── BidPhase — edit order button ────────────────────────────────────────────

describe('BidPhase — edit order button', () => {
  it('shows "Editar ordem" button in bids sub-phase', () => {
    renderPage({
      phase: 'bid',
      currentRound: makeRound(),
    });
    expect(screen.getByText('Editar ordem')).toBeInTheDocument();
  });

  it('does not show "Editar ordem" button in manilha sub-phase', () => {
    renderPage({
      phase: 'bid',
      currentRound: makeRound({ bidSubPhase: 'manilha', manilha: null }),
    });
    expect(screen.queryByText('Editar ordem')).not.toBeInTheDocument();
  });

  it('does not show "Editar ordem" button in dealer sub-phase', () => {
    renderPage({
      phase: 'bid',
      currentRound: makeRound({ bidSubPhase: 'dealer' }),
    });
    expect(screen.queryByText('Editar ordem')).not.toBeInTheDocument();
  });

  it('clicking "Editar ordem" opens PlayerOrderModal', () => {
    renderPage({
      phase: 'bid',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Editar ordem'));
    expect(screen.getByText('Editar ordem dos jogadores')).toBeInTheDocument();
  });

  it('cancelling PlayerOrderModal closes it without changing order', () => {
    renderPage({
      phase: 'bid',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Editar ordem'));
    expect(screen.getByText('Editar ordem dos jogadores')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Editar ordem dos jogadores')).not.toBeInTheDocument();
  });

  it('confirming PlayerOrderModal calls reorderPlayers and closes modal', () => {
    const reorderPlayers = vi.fn();
    vi.spyOn(useGameStore.getState(), 'reorderPlayers').mockImplementation(reorderPlayers);
    renderPage({
      phase: 'bid',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Editar ordem'));
    fireEvent.click(screen.getByText('Confirmar'));
    expect(reorderPlayers).toHaveBeenCalled();
    expect(screen.queryByText('Editar ordem dos jogadores')).not.toBeInTheDocument();
  });
});

// ─── PlayingPhase — edit order button ────────────────────────────────────────

describe('PlayingPhase — edit order button', () => {
  it('shows "Editar ordem" button in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    expect(screen.getByText('Editar ordem')).toBeInTheDocument();
  });

  it('clicking "Editar ordem" opens PlayerOrderModal in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Editar ordem'));
    expect(screen.getByText('Editar ordem dos jogadores')).toBeInTheDocument();
  });

  it('cancelling PlayerOrderModal in playing phase closes it without changing order', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Editar ordem'));
    expect(screen.getByText('Editar ordem dos jogadores')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Editar ordem dos jogadores')).not.toBeInTheDocument();
  });

  it('confirming PlayerOrderModal in playing phase calls reorderPlayers and closes modal', () => {
    const reorderPlayers = vi.fn();
    vi.spyOn(useGameStore.getState(), 'reorderPlayers').mockImplementation(reorderPlayers);
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Editar ordem'));
    fireEvent.click(screen.getByText('Confirmar'));
    expect(reorderPlayers).toHaveBeenCalled();
    expect(screen.queryByText('Editar ordem dos jogadores')).not.toBeInTheDocument();
  });
});

// ─── PlayingPhase — dealer toggle ─────────────────────────────────────────────

describe('PlayingPhase — dealer toggle', () => {
  it('shows dealer change button in playing phase', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    expect(screen.getByText('Alterar distribuidor')).toBeInTheDocument();
  });

  it('clicking dealer change button shows DealerSelectionStep', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Alterar distribuidor'));
    expect(screen.getByText('Quem distribui as cartas?')).toBeInTheDocument();
  });

  it('clicking Cancelar hides DealerSelectionStep', () => {
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Alterar distribuidor'));
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Quem distribui as cartas?')).not.toBeInTheDocument();
  });

  it('confirming dealer change calls confirmDealer', () => {
    const confirmDealer = vi.fn();
    vi.spyOn(useGameStore.getState(), 'confirmDealer').mockImplementation(confirmDealer);
    renderPage({
      phase: 'playing',
      currentRound: makeRound(),
    });
    fireEvent.click(screen.getByText('Alterar distribuidor'));
    // Click Bob's player button inside the modal to select him as dealer
    const modal = screen.getByRole('heading', { name: 'Alterar distribuidor' }).closest('div[class*="bg-slate-800"]') as HTMLElement;
    const bobButton = within(modal).getByText('Bob').closest('button') as HTMLElement;
    fireEvent.click(bobButton);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(confirmDealer).toHaveBeenCalled();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RoundHistoryTable } from '../RoundHistoryTable';
import type { RoundHistory, Player } from '@/types';

function makePlayer(id: string, name: string): Player {
  return { id, name, position: 0, lives: 5, alive: true };
}

function makeHistory(overrides: Partial<RoundHistory> = {}): RoundHistory {
  return {
    round: 1,
    manilha: { value: '7' },
    cardsPerPlayer: 1,
    bids: {},
    tricks: {},
    losses: {},
    ...overrides,
  };
}

function renderExpanded(history: RoundHistory[], players: Player[]) {
  render(<RoundHistoryTable history={history} players={players} />);
  // Click the accordion to expand
  fireEvent.click(screen.getByRole('button'));
}

describe('RoundHistoryTable — participation display', () => {
  it('shows "0/0" for alive player with bid=0 and tricks=0', () => {
    const player = makePlayer('p1', 'Alice');
    const history = makeHistory({
      bids: { p1: 0 },
      tricks: { p1: 0 },
      losses: { p1: 0 },
    });

    renderExpanded([history], [player]);

    expect(screen.queryByText('–')).not.toBeInTheDocument();
    // bid "0" and tricks "0" are rendered as "0/0"
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('shows "–" for eliminated player absent from losses', () => {
    const player = makePlayer('p1', 'Alice');
    const history = makeHistory({
      bids: {},
      tricks: {},
      losses: {}, // p1 absent → was eliminated before this round
    });

    renderExpanded([history], [player]);

    expect(screen.getByText('–')).toBeInTheDocument();
  });

  it('shows loss indicator for player who lost lives', () => {
    const player = makePlayer('p1', 'Alice');
    const history = makeHistory({
      bids: { p1: 2 },
      tricks: { p1: 0 },
      losses: { p1: 2 },
    });

    renderExpanded([history], [player]);

    // Loss indicator renders as " -" and "2" in separate text nodes inside a red span
    const redSpan = document.querySelector('.text-red-400');
    expect(redSpan).not.toBeNull();
    expect(redSpan!.textContent).toContain('2');
  });

  it('shows data for participating player even when bid is 0 (no loss)', () => {
    const player = makePlayer('p1', 'Alice');
    const history = makeHistory({
      bids: { p1: 0 },
      tricks: { p1: 0 },
      losses: { p1: 0 },
    });

    renderExpanded([history], [player]);

    // Should NOT show "–" (elimination indicator)
    expect(screen.queryByText('–')).not.toBeInTheDocument();
  });

  it('correctly distinguishes eliminated player from participating zero-bid player', () => {
    const alive = makePlayer('p1', 'Alice');
    const eliminated = makePlayer('p2', 'Bob');
    const history = makeHistory({
      bids: { p1: 0 },
      tricks: { p1: 0 },
      losses: { p1: 0 }, // p2 absent → eliminated
    });

    renderExpanded([history], [alive, eliminated]);

    // Bob is eliminated → shows "–"
    expect(screen.getByText('–')).toBeInTheDocument();
    // Alice participated with 0 bid → no "–" for her (0 is shown)
    const cells = screen.getAllByRole('cell');
    const aliceCell = cells.find(c => c.querySelector('span'));
    expect(aliceCell).toBeDefined();
  });
});

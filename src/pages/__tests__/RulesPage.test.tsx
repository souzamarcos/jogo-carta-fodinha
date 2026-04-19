import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RulesPage from '../RulesPage';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  mockNavigate.mockClear();
});

function renderRulesPage() {
  return render(
    <MemoryRouter>
      <RulesPage />
    </MemoryRouter>
  );
}

describe('RulesPage', () => {
  it('renders the page title', () => {
    renderRulesPage();
    expect(screen.getByRole('heading', { name: /Regras do Jogo/i })).toBeInTheDocument();
  });

  it('renders all required section headings', () => {
    renderRulesPage();
    const requiredSections = [
      'Objetivo do jogo',
      'O baralho',
      'A manilha',
      'Rodadas e distribui',
      'O distribuidor',
      'Palpite',
      'Vaza',
      'Cálculo de perda de vidas',
      'Eliminação e vitória',
      'Modos do aplicativo',
    ];
    for (const heading of requiredSections) {
      const matches = screen.getAllByRole('heading', { name: new RegExp(heading, 'i') });
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it('renders card value hierarchy', () => {
    renderRulesPage();
    // 4 is weakest, 3 is strongest
    const cards = screen.getAllByText('4');
    expect(cards.length).toBeGreaterThan(0);
    const threes = screen.getAllByText('3');
    expect(threes.length).toBeGreaterThan(0);
  });

  it('shows manilha suit hierarchy text', () => {
    renderRulesPage();
    // The hierarchy line in the manilha section uses < separators
    const hierarchyEl = screen.getAllByText(/Paus.*Copas.*Espadas.*Ouros/i);
    expect(hierarchyEl.length).toBeGreaterThan(0);
  });

  it('shows life loss examples', () => {
    renderRulesPage();
    expect(screen.getByText(/Palpitou 2, ganhou 2/i)).toBeInTheDocument();
    expect(screen.getByText(/0 vidas perdidas/i)).toBeInTheDocument();
  });

  it('renders the Voltar button', () => {
    renderRulesPage();
    expect(screen.getByText(/Voltar/i)).toBeInTheDocument();
  });

  it('clicking Voltar calls navigate(-1)', async () => {
    renderRulesPage();
    await userEvent.click(screen.getByText(/Voltar/i));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

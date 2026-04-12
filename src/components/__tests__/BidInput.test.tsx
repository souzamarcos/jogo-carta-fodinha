import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BidInput } from '../BidInput';

describe('BidInput', () => {
  it('renders the current value', () => {
    render(<BidInput value={3} min={0} max={5} onChange={vi.fn()} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onChange with incremented value when "+" is clicked', () => {
    const onChange = vi.fn();
    render(<BidInput value={3} min={0} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByText('+'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('"+" button is disabled at max', () => {
    const onChange = vi.fn();
    render(<BidInput value={5} min={0} max={5} onChange={onChange} />);
    const plusButton = screen.getByText('+');
    expect(plusButton).toBeDisabled();
  });

  it('calls onChange with decremented value when "−" is clicked', () => {
    const onChange = vi.fn();
    render(<BidInput value={3} min={0} max={5} onChange={onChange} />);
    fireEvent.click(screen.getByText('−'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('"−" button is disabled at min', () => {
    const onChange = vi.fn();
    render(<BidInput value={0} min={0} max={5} onChange={onChange} />);
    const minusButton = screen.getByText('−');
    expect(minusButton).toBeDisabled();
  });

  it('renders a label when provided', () => {
    render(<BidInput value={2} max={5} onChange={vi.fn()} label="Palpite" />);
    expect(screen.getByText('Palpite')).toBeInTheDocument();
  });
});

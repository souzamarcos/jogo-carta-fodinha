import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LivesIndicator } from '../LivesIndicator';

describe('LivesIndicator', () => {
  it('shows green when lives > 3', () => {
    const { container } = render(<LivesIndicator lives={4} alive={true} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveClass('bg-green-500');
  });

  it('shows yellow when lives === 3', () => {
    const { container } = render(<LivesIndicator lives={3} alive={true} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveClass('bg-yellow-400');
  });

  it('shows red when lives <= 2', () => {
    const { container } = render(<LivesIndicator lives={2} alive={true} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveClass('bg-red-500');
  });

  it('shows red when lives === 1', () => {
    const { container } = render(<LivesIndicator lives={1} alive={true} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveClass('bg-red-500');
  });

  it('shows gray when alive=false', () => {
    const { container } = render(<LivesIndicator lives={5} alive={false} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveClass('bg-gray-500');
  });

  it('shows gray when lives <= 0', () => {
    const { container } = render(<LivesIndicator lives={0} alive={true} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toHaveClass('bg-gray-500');
  });

  it('renders the lives count', () => {
    render(<LivesIndicator lives={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

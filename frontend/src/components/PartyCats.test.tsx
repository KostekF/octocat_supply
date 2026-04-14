import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

function renderRoute(path: string) {
  window.history.pushState({}, 'Test route', path);
  return render(<App />);
}

describe('Party Cats route integration', () => {
  it('renders party cats page content at /party-cats', () => {
    renderRoute('/party-cats');

    expect(screen.getByRole('heading', { name: /dancing cat parade/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /throw extra confetti/i })).toBeInTheDocument();
  });

  it('shows recurring confetti bursts over time', () => {
    vi.useFakeTimers();
    renderRoute('/party-cats');

    const initial = screen.getAllByTestId('confetti-piece').length;
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    const afterCleanup = screen.queryAllByTestId('confetti-piece').length;
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    const afterInterval = screen.getAllByTestId('confetti-piece').length;

    expect(initial).toBeGreaterThan(0);
    expect(afterCleanup).toBe(0);
    expect(afterInterval).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  it('includes Party Cats link in top navigation', () => {
    renderRoute('/party-cats');

    expect(screen.getByRole('link', { name: /party cats/i })).toBeInTheDocument();
  });
});

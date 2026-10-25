import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { PotionGame } from './PotionGame';
import { usePotionStore } from '../stores/potionStore';

const tick = (ms: number) => {
  for (let t = 0; t < ms; t += 100) act(() => { vi.advanceTimersByTime(100); });
};

describe('PotionGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => usePotionStore.getState().resetGame());
    act(() => usePotionStore.getState().startGame({ numTrials: 2, responseTimeLimitMs: 2000, dominantProbability: 0.8, recipeChange: false }));
  });
  afterEach(() => vi.useRealTimers());

  it('takes arrow keys, shows the produced potion, then moves to the next trial', () => {
    render(<PotionGame />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' }); // 결과를 보여 주는 동안의 입력은 무시
    const [first] = usePotionStore.getState().results;
    expect(usePotionStore.getState().results).toHaveLength(1);
    expect(first.playerChoice).toBe('RED');
    expect(screen.getByText(/만들어진 약/)).toBeInTheDocument();

    tick(1000);
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  it('records a timeout and finishes after the last trial', () => {
    render(<PotionGame />);
    tick(2100);
    expect(usePotionStore.getState().results[0]).toMatchObject({ playerChoice: null, isCorrect: false });
    expect(screen.getByText('시간 초과')).toBeInTheDocument();

    tick(1000);
    fireEvent.click(screen.getByRole('button', { name: '← 파란 약' }));
    tick(1000);
    expect(usePotionStore.getState().gameMode).toBe('result');
    expect(usePotionStore.getState().results.map((r) => r.playerChoice)).toEqual([null, 'BLUE']);
  });
});

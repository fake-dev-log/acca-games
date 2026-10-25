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
    act(() => usePotionStore.getState().startGame({ numTrials: 2, responseTimeLimitMs: 2000, dominantProbability: 0.8, recipeChange: false, isRealMode: false }));
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

  // 같은 조합을 1번·4번에 두고 결과를 다르게 고정한 뒤 4번째까지 답한다
  const playSameComboTwice = (isRealMode: boolean) => {
    act(() => usePotionStore.getState().startGame({ numTrials: 4, responseTimeLimitMs: 2000, dominantProbability: 0.8, recipeChange: false, isRealMode }));
    const { gameState } = usePotionStore.getState();
    const trials = [...gameState!.trials];
    trials[3] = { ...trials[3], combo: trials[0].combo, outcome: trials[0].outcome === 'RED' ? 'BLUE' : 'RED' };
    act(() => usePotionStore.setState({ gameState: { ...gameState!, trials } }));
    render(<PotionGame />);
    for (let i = 0; i < 3; i++) {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(screen.queryByText(/지난번과 다른 약/)).not.toBeInTheDocument();
      tick(1000);
    }
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
  };

  it('marks, in practice mode, a combo whose result differs from last time', () => {
    playSameComboTwice(false);
    expect(screen.getByText(/지난번과 다른 약/)).toBeInTheDocument();
  });

  it('does not mark it in real mode', () => {
    playSameComboTwice(true);
    expect(screen.queryByText(/지난번과 다른 약/)).not.toBeInTheDocument();
  });
});

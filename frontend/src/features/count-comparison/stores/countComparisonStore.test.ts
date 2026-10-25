import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCountComparisonStore } from './countComparisonStore';
import { countComparisonEngine } from '../logic/CountComparisonEngine';
import { CountComparisonSettings } from '../logic/types';

const settings: CountComparisonSettings = { numProblems: 3, presentationTime: 500, inputTime: 1000, isRealMode: false };

describe('useCountComparisonStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => useCountComparisonStore.getState().resetGame());
  });

  it('starts a game and shows the first problem', () => {
    act(() => useCountComparisonStore.getState().startGame(settings));
    const state = useCountComparisonStore.getState();
    expect(state.gameMode).toBe('playing');
    expect(state.currentProblem!.problemNumber).toBe(1);
    expect(state.sessionId).not.toBeNull();
  });

  it('records answers and ends after the last problem', () => {
    act(() => useCountComparisonStore.getState().startGame(settings));
    for (let i = 0; i < settings.numProblems; i++) {
      const problem = useCountComparisonStore.getState().currentProblem!;
      const wrongSide = problem.correctSide === 'left' ? 'right' : 'left';
      act(() => {
        const ok = useCountComparisonStore.getState().submitAnswer({
          problemNumber: problem.problemNumber, playerChoice: i === 0 ? wrongSide : problem.correctSide, responseTimeMs: 400,
        });
        expect(ok).toBe(i !== 0);
        useCountComparisonStore.getState().fetchNextProblem();
      });
    }
    const state = useCountComparisonStore.getState();
    expect(state.results.map((r) => r.isCorrect)).toEqual([false, true, true]);
    expect(state.gameMode).toBe('result');
    expect(state.currentProblem).toBeNull();
  });

  it('goes back to setup when starting fails', () => {
    vi.spyOn(countComparisonEngine, 'startGame').mockImplementation(() => { throw new Error('boom'); });
    act(() => useCountComparisonStore.getState().startGame(settings));
    expect(useCountComparisonStore.getState().gameMode).toBe('setup');
    expect(useCountComparisonStore.getState().error).toBe('boom');
  });

  it('ignores answers submitted after the last problem', () => {
    act(() => useCountComparisonStore.getState().startGame({ ...settings, numProblems: 1 }));
    const problem = useCountComparisonStore.getState().currentProblem!;
    act(() => {
      useCountComparisonStore.getState().submitAnswer({ problemNumber: 1, playerChoice: problem.correctSide, responseTimeMs: 300 });
      expect(useCountComparisonStore.getState().submitAnswer({ problemNumber: 2, playerChoice: 'left', responseTimeMs: 300 })).toBe(false);
    });
    expect(useCountComparisonStore.getState().results).toHaveLength(1);
  });
});

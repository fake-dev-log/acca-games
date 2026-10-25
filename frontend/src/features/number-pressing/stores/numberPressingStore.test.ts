import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { useNumberPressingStore } from './numberPressingStore';
import { numberPressingEngine } from '../logic/NumberPressingEngine';
import { NumberPressingSetup } from '../logic/types';

const setup: NumberPressingSetup = { isRealMode: false, rounds: [1, 2], problemsPerRound: 5, timeLimitR1: 60, timeLimitR2: 120 };

describe('useNumberPressingStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => useNumberPressingStore.getState().resetGame());
  });

  it('starts a game with problems only for the selected rounds', async () => {
    await act(() => useNumberPressingStore.getState().startGame({ ...setup, rounds: [2] }));
    const { gameState, gameMode } = useNumberPressingStore.getState();
    expect(gameMode).toBe('playing');
    expect(gameState!.problemsR1).toHaveLength(0);
    expect(gameState!.problemsR2).toHaveLength(5);
  });

  it('collects round 1 and round 2 results separately', async () => {
    await act(() => useNumberPressingStore.getState().startGame(setup));
    const { gameState } = useNumberPressingStore.getState();
    await act(() => useNumberPressingStore.getState().submitAnswerR1({ sessionId: gameState!.id, problem: gameState!.problemsR1[0], timeTaken: 0.8, isCorrect: true }));
    await act(() => useNumberPressingStore.getState().submitAnswerR2({
      sessionId: gameState!.id, problem: gameState!.problemsR2[0], playerClicks: [1], correctClicks: [1, 2], timeTaken: 3.2, isCorrect: false,
    }));
    const { results } = useNumberPressingStore.getState();
    expect(results.resultsR1).toHaveLength(1);
    expect(results.resultsR2).toHaveLength(1);
  });

  it('keeps results unchanged when the engine rejects a submission', async () => {
    await act(() => useNumberPressingStore.getState().startGame(setup));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(numberPressingEngine, 'submitResultR1').mockImplementation(() => { throw new Error('Game not started'); });
    await act(() => useNumberPressingStore.getState().submitAnswerR1({ sessionId: 1, problem: { targetNumber: 3 }, timeTaken: 1, isCorrect: true }));
    expect(useNumberPressingStore.getState().results.resultsR1).toHaveLength(0);
  });

  it('goes back to setup when starting fails', async () => {
    vi.spyOn(numberPressingEngine, 'startGame').mockImplementation(() => { throw new Error('boom'); });
    await act(() => useNumberPressingStore.getState().startGame(setup));
    expect(useNumberPressingStore.getState().gameMode).toBe('setup');
    expect(useNumberPressingStore.getState().error).toBe('boom');
  });
});

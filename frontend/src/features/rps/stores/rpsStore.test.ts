import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { useRpsStore } from './rpsStore';
import { rpsEngine } from '../logic/RPSEngine';
import { RpsSettings } from '../logic/types';

const settings: RpsSettings = { rounds: [1, 2, 3], questionsPerRound: 4, timeLimitMs: 3000, isRealMode: false };

describe('useRpsStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => useRpsStore.getState().resetGame());
  });

  it('starts a game with questionsPerRound problems for each selected round', async () => {
    await act(() => useRpsStore.getState().startGame(settings));
    const state = useRpsStore.getState();
    expect(state.gameMode).toBe('playing');
    expect(state.gameState!.problems).toHaveLength(12);
    expect(state.gameState!.problems.map((p) => p.round)).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]);
    expect(state.sessionId).toBe(state.gameState!.id);
    expect(state.error).toBeNull();
  });

  it('records correct and wrong answers', async () => {
    await act(() => useRpsStore.getState().startGame(settings));
    const [first, second] = useRpsStore.getState().gameState!.problems;

    const right = await useRpsStore.getState().submitAnswer(first.correctChoice, 500, 1);
    const wrong = await useRpsStore.getState().submitAnswer('MISS', 3000, 2);

    expect(right!.isCorrect).toBe(true);
    expect(wrong!.isCorrect).toBe(false);
    expect(wrong!.correctChoice).toBe(second.correctChoice);
    expect(useRpsStore.getState().results).toHaveLength(2);
  });

  it('returns null and keeps results when the question number is out of range', async () => {
    await act(() => useRpsStore.getState().startGame({ ...settings, rounds: [1], questionsPerRound: 3 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await useRpsStore.getState().submitAnswer('ROCK', 100, 0)).toBeNull();
    expect(await useRpsStore.getState().submitAnswer('ROCK', 100, 4)).toBeNull();
    expect(useRpsStore.getState().results).toHaveLength(0);
  });

  it('goes back to setup with the error message when the engine fails', async () => {
    vi.spyOn(rpsEngine, 'startGame').mockImplementation(() => { throw new Error('boom'); });
    await act(() => useRpsStore.getState().startGame(settings));
    const state = useRpsStore.getState();
    expect(state.gameMode).toBe('setup');
    expect(state.error).toBe('boom');
    expect(state.gameState).toBeNull();
  });

  it('starts an empty game when no round is selected', async () => {
    await act(() => useRpsStore.getState().startGame({ ...settings, rounds: [] }));
    expect(useRpsStore.getState().gameState!.problems).toEqual([]);
  });
});

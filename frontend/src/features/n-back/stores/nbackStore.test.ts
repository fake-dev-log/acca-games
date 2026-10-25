import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { useNBackStore } from './nbackStore';
import { nBackEngine } from '../logic/NBackEngine';
import { NBackSettings } from '../logic/types';

const settings: NBackSettings = { numTrials: 20, presentationTime: 1000, nBackLevel: 2, shapeGroup: 'group1', isRealMode: false };

describe('useNBackStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => useNBackStore.getState().resetGame());
  });

  it('starts a game with a sequence of numTrials shapes from the chosen group', async () => {
    await act(() => useNBackStore.getState().startGame(settings));
    const state = useNBackStore.getState();
    expect(state.gameMode).toBe('playing');
    expect(state.gameState!.shapeSequence).toHaveLength(20);
    expect(new Set(state.gameState!.shapeSequence)).toEqual(new Set(['circle', 'triangle', 'square']));
    expect(state.sessionId).toBe(state.gameState!.id);
  });

  it('judges answers against 2-back / 3-back matches', async () => {
    await act(() => useNBackStore.getState().startGame(settings));
    const seq = useNBackStore.getState().gameState!.shapeSequence;
    const expected = (i: number) => (seq[i] === seq[i - 2] ? 'LEFT' : seq[i] === seq[i - 3] ? 'RIGHT' : 'SPACE');

    // 처음 두 문제는 비교할 이전 도형이 없어서 항상 SPACE
    expect((await useNBackStore.getState().submitAnswer('SPACE', 300, 0))!.isCorrect).toBe(true);
    expect((await useNBackStore.getState().submitAnswer('LEFT', 300, 1))!.isCorrect).toBe(false);
    const r = await useNBackStore.getState().submitAnswer(expected(5), 300, 5);
    expect(r!.isCorrect).toBe(true);
    expect(r!.presentedShape).toBe(seq[5]);
    expect(useNBackStore.getState().results).toHaveLength(3);
  });

  it('returns null and keeps results when the engine throws', async () => {
    await act(() => useNBackStore.getState().startGame(settings));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(nBackEngine, 'submitAnswer').mockImplementation(() => { throw new Error('no game'); });
    expect(await useNBackStore.getState().submitAnswer('SPACE', 100, 0)).toBeNull();
    expect(useNBackStore.getState().results).toHaveLength(0);
  });

  it('falls back to group1 for an unknown shape group', async () => {
    await act(() => useNBackStore.getState().startGame({ ...settings, shapeGroup: 'nope' }));
    expect(new Set(useNBackStore.getState().gameState!.shapeSequence)).toEqual(new Set(['circle', 'triangle', 'square']));
  });
});

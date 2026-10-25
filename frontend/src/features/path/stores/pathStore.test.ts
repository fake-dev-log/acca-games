import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePathStore } from './pathStore';
import { ROUND_CONFIGS } from '../logic/generator';
import { PathSettings } from '../logic/types';

const settings: PathSettings = { rounds: [1, 3], timeLimitSec: 180, isRealMode: false };
const store = () => usePathStore.getState();

// 정답 배치를 클릭으로 놓는다('/' 한 번, '\' 두 번)
const placeSolution = () => {
  store().puzzle!.solution.forEach((row, r) => row.forEach((cell, c) => {
    const times = cell === '/' ? 1 : cell === '\\' ? 2 : 0;
    for (let i = 0; i < times; i++) act(() => store().clickCell(r, c));
  }));
};

describe('usePathStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => store().resetGame());
    act(() => store().startGame(settings));
  });

  it('starts with an empty board of the first round size', () => {
    expect(store().gameMode).toBe('playing');
    expect(store().puzzle!.size).toBe(ROUND_CONFIGS[1].size);
    expect(store().board.flat().every((c) => c === null)).toBe(true);
  });

  it('cycles a cell empty → / → \\ → empty and counts every click', () => {
    act(() => store().clickCell(0, 0));
    expect(store().board[0][0]).toBe('/');
    act(() => store().clickCell(0, 0));
    expect(store().board[0][0]).toBe('\\');
    act(() => store().clickCell(0, 0));
    expect(store().board[0][0]).toBeNull();
    expect(store().clicks).toBe(3);
  });

  it('records a solved puzzle with the minimum clicks and moves on after advance', () => {
    const puzzle = store().puzzle!;
    placeSolution();
    let ok = false;
    act(() => { ok = store().launch(); });
    expect(ok).toBe(true);
    expect(store().solved).toBe(true);
    expect(store().results[0]).toMatchObject({ isCorrect: true, fencesUsed: puzzle.minFences, clicks: puzzle.minClicks, attempts: 1, round: 1, revealed: false });

    act(() => { store().launch(); store().clickCell(0, 0); }); // 성공 표시 중 입력은 무시
    expect(store().results).toHaveLength(1);
    act(() => store().advance());
    expect(store().puzzle).not.toBe(puzzle);
    expect(store().clicks).toBe(0);
  });

  it('keeps a failed launch on the same puzzle and clears the paths on the next edit', () => {
    let ok = true;
    act(() => { ok = store().launch(); }); // 빈 판 — 생성기는 울타리 없이 풀리는 문제를 내지 않는다
    expect(ok).toBe(false);
    expect(store().lastCheck!.success).toBe(false);
    expect(store().attempts).toBe(1);
    expect(store().results).toHaveLength(0);
    act(() => store().clickCell(1, 1));
    expect(store().lastCheck).toBeNull();
  });

  it('records skipped and revealed puzzles as unsolved', () => {
    act(() => store().clickCell(0, 0));
    act(() => store().skip());
    act(() => store().reveal());
    expect(store().board).toEqual(store().puzzle!.solution);
    expect(store().lastCheck!.success).toBe(true);
    act(() => store().skip());
    expect(store().results.map((r) => [r.isCorrect, r.revealed])).toEqual([[false, false], [false, true]]);
  });

  it('ends a round on time-up, skipping an untouched puzzle, and finishes after the last round', () => {
    act(() => store().endRound());
    expect(store().results).toHaveLength(0);
    expect(store().puzzle!.size).toBe(ROUND_CONFIGS[3].size);

    act(() => store().clickCell(0, 0));
    act(() => store().endRound());
    expect(store().results).toHaveLength(1);
    expect(store().results[0]).toMatchObject({ round: 3, isCorrect: false });
    expect(store().gameMode).toBe('result');
  });

  it('refuses to start without rounds', () => {
    act(() => store().resetGame());
    act(() => store().startGame({ ...settings, rounds: [] }));
    expect(store().gameMode).toBe('setup');
    expect(store().error).toMatch('라운드');
  });
});

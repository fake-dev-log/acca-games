import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePathStore } from './pathStore';
import { MAX_CLICKS, REAL_SETTINGS } from '../logic/PathEngine';
import { PathSettings } from '../logic/types';

const practice: PathSettings = { isRealMode: false, difficulty: 'normal', timeLimitSec: 300, problemCount: 3 };
const store = () => usePathStore.getState();

const placeSolution = () => store().puzzle!.solution.forEach((row, r) => row.forEach((cell, c) => {
  if (cell) act(() => store().toggleAt(r, c, cell));
}));
const openCell = (): [number, number] => {
  const { walls, solution } = store().puzzle!;
  for (let r = 0; r < walls.length; r++) for (let c = 0; c < walls.length; c++) if (!walls[r][c] && !solution[r][c]) return [r, c];
  throw new Error('no open cell');
};

describe('usePathStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => store().resetGame());
    act(() => store().startGame(practice));
  });

  it('places a fence where pressed and removes it on the next press — one click each', () => {
    const [r, c] = openCell();
    act(() => store().toggleAt(r, c, '\\'));
    expect(store().board[r][c]).toBe('\\');
    act(() => store().toggleAt(r, c, '/'));
    expect(store().board[r][c]).toBeNull();
    expect(store().clicks).toBe(2);
  });

  it('changes a chosen cell directly in choose mode and ignores no-op changes', () => {
    const [r, c] = openCell();
    act(() => store().setCell(r, c, '/'));
    act(() => store().setCell(r, c, '\\'));
    act(() => store().setCell(r, c, '\\')); // 같은 값이면 클릭을 쓰지 않는다
    expect(store().board[r][c]).toBe('\\');
    expect(store().clicks).toBe(2);
  });

  it('stops accepting clicks after 20', () => {
    const [r, c] = openCell();
    for (let i = 0; i < MAX_CLICKS + 5; i++) act(() => store().toggleAt(r, c, '/'));
    expect(store().clicks).toBe(MAX_CLICKS);
  });

  it('records a perfect solve, an excess solve and a wrong answer', () => {
    placeSolution();
    act(() => { store().submit(); });
    expect(store().submitted!.verdict).toBe('perfect');
    act(() => store().toggleAt(0, 0, '/')); // 제출 뒤 입력은 무시
    act(() => store().next());

    placeSolution();
    const [r, c] = openCell();
    act(() => store().toggleAt(r, c, '/'));
    act(() => { store().submit(); });
    // 남는 울타리 하나가 경로를 바꿀 수도 있어서 초과 설치 또는 오답
    expect(['excess', 'wrong']).toContain(store().submitted!.verdict);
    act(() => store().next());

    act(() => { store().submit(); }); // 빈 판
    expect(store().submitted!.verdict).toBe('wrong');

    const results = store().results;
    expect(results.map((x) => x.problemNum)).toEqual([1, 2, 3]);
    expect(results[0]).toMatchObject({ verdict: 'perfect', isCorrect: true, excessFences: 0 });
    if (results[1].verdict === 'excess') expect(results[1].excessFences).toBe(1);
    expect(results[2]).toMatchObject({ verdict: 'wrong', isCorrect: false });

    act(() => store().next());
    expect(store().gameMode).toBe('result');
  });

  it('on finish, records a touched-but-unsubmitted puzzle as wrong even if the board is right', () => {
    placeSolution();
    act(() => store().finish());
    expect(store().results).toHaveLength(1);
    expect(store().results[0].verdict).toBe('wrong');
    expect(store().gameMode).toBe('result');
  });

  it('does not record an untouched puzzle on finish', () => {
    act(() => store().finish());
    expect(store().results).toHaveLength(0);
  });

  it('refuses walls and refuses to start with zero problems', () => {
    act(() => store().resetGame());
    act(() => store().startGame({ ...practice, difficulty: 'hard' }));
    const { walls } = store().puzzle!;
    const wall = walls.flatMap((row, r) => row.map((w, c) => (w ? [r, c] : null))).find(Boolean)!;
    act(() => store().toggleAt(wall[0], wall[1], '/'));
    expect(store().clicks).toBe(0);

    act(() => store().resetGame());
    act(() => store().startGame({ ...REAL_SETTINGS, problemCount: 0 }));
    expect(store().gameMode).toBe('setup');
    expect(store().error).toMatch('문제 수');
  });
});

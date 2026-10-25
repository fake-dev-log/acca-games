import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { PathGame } from './PathGame';
import { usePathStore } from '../stores/pathStore';
import { PathSettings } from '../logic/types';

const tick = (ms: number) => {
  for (let t = 0; t < ms; t += 100) act(() => { vi.advanceTimersByTime(100); });
};
const settings = (overrides: Partial<PathSettings> = {}): PathSettings => ({
  isRealMode: false, difficulty: 'normal', timeLimitSec: 60, problemCount: 2, ...overrides,
});

// '칸 누르고 방향 고르기' 로 정답을 놓는다(누른 위치는 jsdom 에서 잴 수 없다)
const enterSolution = () => {
  fireEvent.click(screen.getByRole('button', { name: /칸 누르고 방향 고르기/ }));
  usePathStore.getState().puzzle!.solution.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell) return;
    fireEvent.click(screen.getByRole('button', { name: `${r + 1}행 ${c + 1}열` }));
    fireEvent.click(screen.getByRole('button', { name: cell }));
  }));
};

describe('PathGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => usePathStore.getState().resetGame());
  });
  afterEach(() => vi.useRealTimers());

  it('moves straight on after a perfect solve', () => {
    act(() => usePathStore.getState().startGame(settings()));
    render(<PathGame />);
    const first = usePathStore.getState().puzzle;
    enterSolution();
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(screen.getByText('완벽해요!')).toBeInTheDocument();
    tick(800);
    expect(usePathStore.getState().puzzle).not.toBe(first);
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('in practice, shows the answer and waits for "다음 문제" after a wrong submit', () => {
    act(() => usePathStore.getState().startGame(settings()));
    render(<PathGame />);
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(screen.getByText(/짝 손님에게 가지 못한/)).toBeInTheDocument();
    expect(screen.getByText(/정답 예시/)).toBeInTheDocument();
    tick(2000);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('in real mode, hides the answer and moves on by itself', () => {
    act(() => usePathStore.getState().startGame(settings({ isRealMode: true })));
    render(<PathGame />);
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(screen.queryByText(/정답 예시/)).not.toBeInTheDocument();
    expect(screen.queryByText(/짝 손님에게 가지 못한/)).not.toBeInTheDocument();
    tick(800);
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('ends the session when time runs out', () => {
    act(() => usePathStore.getState().startGame(settings()));
    render(<PathGame />);
    tick(60_200);
    expect(usePathStore.getState().gameMode).toBe('result');
  });
});

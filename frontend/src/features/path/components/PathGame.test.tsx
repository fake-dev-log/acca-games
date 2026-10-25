import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { PathGame } from './PathGame';
import { usePathStore } from '../stores/pathStore';

const tick = (ms: number) => {
  for (let t = 0; t < ms; t += 100) act(() => { vi.advanceTimersByTime(100); });
};

describe('PathGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => usePathStore.getState().resetGame());
    act(() => usePathStore.getState().startGame({ rounds: [1], timeLimitSec: 60, isRealMode: false }));
  });
  afterEach(() => vi.useRealTimers());

  it('places fences by clicking cells and shows success, then the next puzzle', () => {
    render(<PathGame />);
    const { puzzle } = usePathStore.getState();
    expect(screen.getByText(`${puzzle!.minFences}개`)).toBeInTheDocument();

    puzzle!.solution.forEach((row, r) => row.forEach((cell, c) => {
      const times = cell === '/' ? 1 : cell === '\\' ? 2 : 0;
      for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name: `${r + 1}행 ${c + 1}열` }));
    }));
    fireEvent.click(screen.getByRole('button', { name: '출발' }));
    expect(screen.getByText('성공!')).toBeInTheDocument();

    tick(1000);
    expect(usePathStore.getState().puzzle).not.toBe(puzzle);
    expect(screen.getByText('1라운드 · 4×4 · 해결 1문제')).toBeInTheDocument();
  });

  it('shows a failure message for a wrong layout and ends the game when the round time runs out', () => {
    render(<PathGame />);
    fireEvent.click(screen.getByRole('button', { name: '출발' }));
    expect(screen.getByText(/도착하지 못한 차가 있습니다/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '1행 1열' }));
    tick(60_100);
    expect(usePathStore.getState().gameMode).toBe('result');
    expect(usePathStore.getState().results).toHaveLength(1);
  });

  it('hides the reveal button in real mode', () => {
    act(() => usePathStore.getState().startGame({ rounds: [2], timeLimitSec: 60, isRealMode: true }));
    render(<PathGame />);
    expect(screen.queryByRole('button', { name: '정답 보기' })).not.toBeInTheDocument();
  });
});

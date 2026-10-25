import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { AppointmentGame } from './AppointmentGame';
import { useAppointmentStore } from '../stores/appointmentStore';
import { formatItem } from './AppointmentItems';

const start = (isRealMode = false, rounds = [3]) => act(() => {
  useAppointmentStore.getState().startGame({ rounds, problemsPerRound: 2, presentationTimeMs: 1000, responseTimeLimitMs: 3000, isRealMode });
});

// 단계마다 타이머가 렌더 뒤 effect 에서 걸리므로 잘게 나눠 흘린다
const tick = (ms: number) => {
  for (let t = 0; t < ms; t += 100) act(() => { vi.advanceTimersByTime(100); });
};
// 라운드 소개 1.5초 + (사람 1초 + 빈 화면 0.3초) × 3
const toQuestion = () => tick(1500 + 1300 * 3);

describe('AppointmentGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    act(() => useAppointmentStore.getState().resetGame());
  });
  afterEach(() => vi.useRealTimers());

  it('shows the round intro, then the three people one at a time, then the question', () => {
    start();
    render(<AppointmentGame />);
    expect(screen.getByText('3라운드 · 메뉴')).toBeInTheDocument();

    tick(1500);
    expect(screen.getByText(/지수/)).toBeInTheDocument();
    tick(1300);
    expect(screen.getByText(/민준/)).toBeInTheDocument();
    tick(2600);
    expect(screen.getByText('어떤 메뉴를 먹으면 좋을까요?')).toBeInTheDocument();
  });

  it('records a click, shows feedback, and moves on to the next problem', () => {
    start();
    render(<AppointmentGame />);
    toQuestion();
    const problem = useAppointmentStore.getState().gameState!.problems[0];
    fireEvent.click(screen.getByRole('button', { name: formatItem(3, problem.answer) }));

    expect(screen.getByText('정답')).toBeInTheDocument();
    expect(useAppointmentStore.getState().results[0].isCorrect).toBe(true);

    tick(1200);
    expect(screen.getByText(/지수/)).toBeInTheDocument(); // 같은 라운드라 소개 없이 바로
  });

  it('times out once and ends the game after the last problem', () => {
    start(true, [4]);
    render(<AppointmentGame />);
    toQuestion();
    tick(3200); // 응답 제한 3초
    const { results } = useAppointmentStore.getState();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ playerChoice: null, isCorrect: false });

    // 실전 모드는 피드백 없이 다음 문제
    tick(1300 * 3);
    const second = useAppointmentStore.getState().gameState!.problems[1];
    fireEvent.click(screen.getByRole('button', { name: formatItem(4, second.options[0]) }));
    expect(useAppointmentStore.getState().gameMode).toBe('result');
    expect(useAppointmentStore.getState().results).toHaveLength(2);
  });
});

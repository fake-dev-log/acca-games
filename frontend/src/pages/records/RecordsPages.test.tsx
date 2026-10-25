import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GameRecordsPage } from './GameRecordsPage';
import { SessionDetailPage } from './SessionDetailPage';
import { recordStore } from '@records/recordStore';

// jsdom 에는 canvas 가 없다
vi.mock('react-chartjs-2', () => ({ Line: () => <div data-testid="line-chart" /> }));

const rpsResult = (isCorrect: boolean, round = 1) => ({
  sessionId: 0, round, questionNum: 1, problemCardHolder: round === 2 ? 'opponent' : 'me', givenCard: 'ROCK',
  isCorrect, responseTimeMs: 500, playerChoice: 'PAPER', correctChoice: isCorrect ? 'PAPER' : 'SCISSORS',
});
const rpsSettings = { rounds: [1, 2], questionsPerRound: 1, timeLimitMs: 3000, isRealMode: true };

const renderAt = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/records/:slug" element={<GameRecordsPage />} />
      <Route path="/records/:slug/:sessionId" element={<SessionDetailPage />} />
    </Routes>
  </MemoryRouter>,
);

describe('records pages', () => {
  const RPS_ID = 1_600_000_000_000;
  const NBACK_ID = 1_600_086_400_000; // 하루 뒤 — 목록의 날짜 문자열이 겹치지 않게

  beforeAll(async () => {
    await recordStore.save({ id: RPS_ID, gameCode: 'RPS', playedAt: new Date(RPS_ID).toISOString(), settings: rpsSettings, results: [rpsResult(true), rpsResult(false, 2)] });
    await recordStore.save({ id: NBACK_ID, gameCode: 'N_BACK', playedAt: new Date(NBACK_ID).toISOString(),
      settings: { numTrials: 1, presentationTime: 1000, nBackLevel: 1, shapeGroup: 'group1', isRealMode: false }, results: [] });
  });

  it('lists only the selected game\'s sessions with formatted settings', async () => {
    renderAt('/records/rps');
    expect(await screen.findByText(new Date(RPS_ID).toLocaleString())).toBeInTheDocument();
    expect(screen.getByText(/실전 모드: ON/)).toBeInTheDocument();
    expect(screen.queryByText(new Date(NBACK_ID).toLocaleString())).not.toBeInTheDocument();
    expect(screen.getByLabelText('표시할 통계 선택')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows settings, breakdowns and the result table for one session', async () => {
    renderAt(`/records/rps/${RPS_ID}`);
    expect(await screen.findByText('라운드별')).toBeInTheDocument();
    expect(screen.getByText('물음표 위치별')).toBeInTheDocument();
    expect(screen.getByText('1라운드 (나 = ?)')).toBeInTheDocument();
    expect(screen.getByText('전체 정답률')).toBeInTheDocument();
    expect(screen.getAllByText('라운드: 1, 2').length).toBeGreaterThan(0);
  });

  it('does not show a session under another game\'s page', async () => {
    renderAt(`/records/rps/${NBACK_ID}`);
    expect(await screen.findByText('세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('handles unknown games and missing sessions', async () => {
    renderAt('/records/unknown');
    expect(screen.getByText('알 수 없는 게임입니다.')).toBeInTheDocument();
  });

  it('shows not-found for a session id that does not exist', async () => {
    renderAt('/records/rps/42');
    expect(await screen.findByText('세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });
});

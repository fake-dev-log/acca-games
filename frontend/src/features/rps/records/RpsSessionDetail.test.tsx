import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RpsSessionDetail } from './RpsSessionDetail';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { types } from '@wails/go/models';
import { fetchRpsSessionStats, RpsSessionStats } from '@api/stats'; // Import new API and interface

// Mock dependencies
vi.mock('@features/rps/stores/rpsStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));
vi.mock('@api/stats', () => ({
  fetchRpsSessionStats: vi.fn(),
}));

describe('RpsSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.RpsSessionWithResults.createFrom({
    id: 1,
    gameCode: 'RPS',
    playDatetime: '2023-10-28T10:00:00Z',
    settings: JSON.stringify({ rounds: [1], questionsPerRound: 2, timeLimitMs: 1000, isRealMode: false }), // Changed to JSON string
    results: [
      { id: 1, sessionId: 1, questionNum: 1, round: 1, problemCardHolder: 'me', givenCard: 'ROCK', correctChoice: 'PAPER', playerChoice: 'PAPER', isCorrect: true, responseTimeMs: 500 },
      { id: 2, sessionId: 1, questionNum: 2, round: 1, problemCardHolder: 'opponent', givenCard: 'PAPER', correctChoice: 'SCISSORS', playerChoice: 'ROCK', isCorrect: false, responseTimeMs: 600 },
    ],
  });

  const mockRpsSessionStats: RpsSessionStats = {
    sessionId: 1,
    totalQuestions: 2,
    totalCorrect: 1,
    overallAccuracy: 50.00,
    averageResponseTimeMs: 550.00,
    roundStats: [
      {
        round: 1,
        totalQuestions: 2,
        totalCorrect: 1,
        accuracy: 50.00,
        averageResponseTimeMs: 550.00,
        problemCardHolderStats: [
          {
            problemCardHolder: 'me',
            totalQuestions: 1,
            totalCorrect: 1,
            accuracy: 100.00,
            averageResponseTimeMs: 500.00,
          },
          {
            problemCardHolder: 'opponent',
            totalQuestions: 1,
            totalCorrect: 0,
            accuracy: 0.00,
            averageResponseTimeMs: 600.00,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchRpsSessionStats as vi.Mock).mockResolvedValue(mockRpsSessionStats);
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useRpsStore as vi.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/rps/${sessionId}`]}>
        <Routes>
          <Route path="/records/rps/:sessionId" element={<RpsSessionDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state when session is not available and loading is true', async () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: true,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(await screen.findByText('세션 상세 정보를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders error state for session list', async () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: 'Failed to fetch details',
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(await screen.findByText('Failed to fetch details')).toBeInTheDocument();
  });

  it('renders error state for session stats', async () => {
    (fetchRpsSessionStats as vi.Mock).mockRejectedValueOnce(new Error('Stats fetch failed'));
    renderComponent('1', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(await screen.findByText('세션 통계를 불러오는데 실패했습니다.')).toBeInTheDocument();
  });

  it('renders "session not found" message when session does not exist', async () => {
    renderComponent('2', { // Requesting session ID 2, but only session ID 1 is mocked
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(await screen.findByText('세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders session details, charts, and results table when session is found', async () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });

    // Check title
    expect(await screen.findByText('세션 상세 기록 (ID: 1)')).toBeInTheDocument();

    // Check summary
    expect(await screen.findByText('총 문제 수: 2')).toBeInTheDocument();
    expect(await screen.findByText('정답 수: 1')).toBeInTheDocument();
    expect(await screen.findByText('전체 정확도: 50.00%')).toBeInTheDocument();
    expect(await screen.findByText('평균 반응 시간: 550.00 ms')).toBeInTheDocument();

    // Check for charts (2 for round stats, 2 for problemCardHolderStats)
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(4); // 2 round charts + 2 problemCardHolder charts

    // Check for results table
    expect(await screen.findByText('상세 기록')).toBeInTheDocument();
    expect(await screen.findAllByRole('cell', { name: 'PAPER' })).toHaveLength(3); // One given, one player choice, one given in next problem
    expect(await screen.findAllByRole('cell', { name: 'ROCK' })).toHaveLength(2); // One given, one player choice
  });

  it('calls fetchPaginatedSessions if store is empty', async () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(mockFetchPaginatedSessions).toHaveBeenCalledWith(1, 10);
  });
});

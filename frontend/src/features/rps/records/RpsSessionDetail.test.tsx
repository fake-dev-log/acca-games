import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RpsSessionDetail } from './RpsSessionDetail';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/rps/stores/rpsStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));

describe('RpsSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.RpsSessionWithResults.createFrom({
    id: 1,
    gameCode: 'RPS',
    playDatetime: '2023-10-28T10:00:00Z',
    settings: { rounds: [1], questionsPerRound: 2, timeLimitMs: 1000, isRealMode: false },
    results: [
      { questionNum: 1, round: 1, givenCard: 'ROCK', correctChoice: 'PAPER', playerChoice: 'PAPER', isCorrect: true, responseTimeMs: 500 },
      { questionNum: 2, round: 1, givenCard: 'PAPER', correctChoice: 'SCISSORS', playerChoice: 'ROCK', isCorrect: false, responseTimeMs: 600 },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useRpsStore as jest.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/rps/${sessionId}`]}>
        <Routes>
          <Route path="/records/rps/:sessionId" element={<RpsSessionDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state when session is not available and loading is true', () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: true,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('세션 상세 정보를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: 'Failed to fetch details',
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('Failed to fetch details')).toBeInTheDocument();
  });

  it('renders "session not found" message when session does not exist', () => {
    renderComponent('2', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders session details, charts, and results table when session is found', () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });

    // Check title
    expect(screen.getByText('세션 상세 기록 (ID: 1)')).toBeInTheDocument();

    // Check summary
    expect(screen.getByText('총 문제 수: 2')).toBeInTheDocument();
    expect(screen.getByText('정답 수: 1')).toBeInTheDocument();
    expect(screen.getByText('전체 정확도: 50.00%')).toBeInTheDocument();
    expect(screen.getByText('평균 반응 시간: 550.00 ms')).toBeInTheDocument();

    // Check for charts
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);

    // Check for results table
    expect(screen.getByText('상세 기록')).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'PAPER' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('cell', { name: 'ROCK' }).length).toBeGreaterThan(0);
  });

  it('calls fetchPaginatedSessions if store is empty', () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(mockFetchPaginatedSessions).toHaveBeenCalledWith(1, 10);
  });
});

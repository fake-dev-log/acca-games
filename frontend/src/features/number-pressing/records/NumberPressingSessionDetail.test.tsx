import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NumberPressingSessionDetail } from './NumberPressingSessionDetail';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';
import { types } from '@wails/go/models';
import { fetchNumberPressingSessionStats, NumberPressingSessionStats } from '@api/stats'; // Import new API and interface

// Mock dependencies
vi.mock('@features/number-pressing/stores/numberPressingStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));
vi.mock('@api/stats', () => ({
  fetchNumberPressingSessionStats: vi.fn(),
}));

describe('NumberPressingSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.NumberPressingSessionWithResults.createFrom({
    id: 1,
    gameCode: 'NUMBER_PRESSING',
    playDatetime: '2023-10-29T10:00:00Z',
    settings: JSON.stringify({ rounds: [1, 2], problemsPerRound: 1, timeLimitR1: 30, timeLimitR2: 60, isRealMode: false }), // Changed to JSON string
    results: {
      resultsR1: [
        { id: 1, sessionId: 1, problem: { targetNumber: 5 }, isCorrect: true, timeTaken: 1.2 },
      ],
      resultsR2: [
        { id: 2, sessionId: 1, problem: { doubleClick: [3], skip: [7] }, playerClicks: [1,2,3,3,4,5,6,8,9], correctClicks: [1,2,3,3,4,5,6,8,9], isCorrect: true, timeTaken: 15.5 },
      ],
    },
  });

  const mockNumberPressingSessionStats: NumberPressingSessionStats = {
    sessionId: 1,
    totalQuestions: 2,
    totalCorrect: 2,
    overallAccuracy: 100.00,
    averageTimeTakenSec: (1.2 + 15.5) / 2,
    roundStats: [
      {
        round: 1,
        totalQuestions: 1,
        totalCorrect: 1,
        accuracy: 100.00,
        averageTimeTakenSec: 1.2,
      },
      {
        round: 2,
        totalQuestions: 1,
        totalCorrect: 1,
        accuracy: 100.00,
        averageTimeTakenSec: 15.5,
        conditionStats: [
          {
            conditionType: 'DC:[3], S:[7]',
            totalQuestions: 1,
            totalCorrect: 1,
            accuracy: 100.00,
            averageTimeTakenSec: 15.5,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchNumberPressingSessionStats as vi.Mock).mockResolvedValue(mockNumberPressingSessionStats);
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useNumberPressingStore as vi.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/number-pressing/${sessionId}`]}>
        <Routes>
          <Route path="/records/number-pressing/:sessionId" element={<NumberPressingSessionDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state', async () => {
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
    (fetchNumberPressingSessionStats as vi.Mock).mockRejectedValueOnce(new Error('Stats fetch failed'));
    renderComponent('1', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(await screen.findByText('세션 통계를 불러오는데 실패했습니다.')).toBeInTheDocument();
  });

  it('renders "session not found" message', async () => {
    renderComponent('2', { // Requesting session ID 2, but only session ID 1 is mocked
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(await screen.findByText('세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders session details when session is found', async () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });

    // Check title and summary
    expect(await screen.findByText('세션 상세 기록 (ID: 1)')).toBeInTheDocument();
    expect(await screen.findByText('총 문제 수: 2')).toBeInTheDocument();
    expect(await screen.findByText('정답 수: 2')).toBeInTheDocument();
    expect(await screen.findByText('전체 정확도: 100.00%')).toBeInTheDocument();

    // Check for charts (2 for round stats, 2 for condition stats)
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(4); // 2 round charts + 2 condition charts

    // Check for results tables
    expect(await screen.findByText('1라운드 상세 기록')).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: '5' })).toBeInTheDocument();
    expect(await screen.findByText('2라운드 상세 기록')).toBeInTheDocument();
    expect(await screen.findAllByRole('cell', { name: '1, 2, 3, 3, 4, 5, 6, 8, 9' })).toHaveLength(2);
  });
});

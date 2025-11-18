import { render, screen, } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShapeRotationSessionDetail } from './ShapeRotationSessionDetail';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import { types } from '@wails/go/models';
import { fetchShapeRotationSessionStats, ShapeRotationSessionStats } from '@api/stats'; // Import new API and interface

// Mock dependencies
vi.mock('@features/shape-rotation/stores/shapeRotationStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));
vi.mock('@api/stats', () => ({
  fetchShapeRotationSessionStats: vi.fn(),
}));

describe('ShapeRotationSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.ShapeRotationSessionWithResults.createFrom({
    id: 1,
    gameCode: 'SHAPE_ROTATION',
    playDatetime: '2023-10-30T10:00:00Z',
    settings: JSON.stringify({ round: 1, numProblems: 1, timeLimit: 180, isRealMode: false }), // Changed to JSON string
    results: [
      { id: 1, sessionId: 1, problemId: 1, isCorrect: true, solveTime: 10000, clickCount: 5, userSolution: ['rotate_left_45'] },
    ],
  });

  const mockShapeRotationSessionStats: ShapeRotationSessionStats = {
    sessionId: 1,
    totalQuestions: 1,
    totalCorrect: 1,
    overallAccuracy: 100.00,
    averageSolveTimeMs: 10000.00,
    averageClickCount: 5.00,
    roundStats: [
      {
        round: 1,
        totalQuestions: 1,
        totalCorrect: 1,
        accuracy: 100.00,
        averageSolveTimeMs: 10000.00,
        averageClickCount: 5.00,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchShapeRotationSessionStats as vi.Mock).mockResolvedValue(mockShapeRotationSessionStats);
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useShapeRotationStore as vi.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/shape-rotation/${sessionId}`]}>
        <Routes>
          <Route path="/records/shape-rotation/:sessionId" element={<ShapeRotationSessionDetail />} />
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
    (fetchShapeRotationSessionStats as vi.Mock).mockRejectedValueOnce(new Error('Stats fetch failed'));
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
    expect(await screen.findByText('총 문제 수: 1')).toBeInTheDocument();
    expect(await screen.findByText('정답 수: 1')).toBeInTheDocument();
    expect(await screen.findByText('전체 정확도: 100.00%')).toBeInTheDocument();
    expect(await screen.findByText('평균 풀이 시간: 10000.00 ms (10.00 초)')).toBeInTheDocument();
    expect(await screen.findByText('평균 클릭 수: 5.00')).toBeInTheDocument();

    // Check for charts (3 for round stats)
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(3);

    // Check for results table
    expect(await screen.findByText('상세 기록')).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: '10.00' })).toBeInTheDocument();
    expect(await screen.findByRole('cell', { name: 'rotate_left_45' })).toBeInTheDocument();
  });
});

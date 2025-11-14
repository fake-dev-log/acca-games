import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NBackSessionDetail } from './NBackSessionDetail';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { types } from '@wails/go/models';
import { fetchNBackSessionStats, NBackSessionStats } from '@api/stats'; // Import new API and interface

// Mock dependencies
vi.mock('@features/n-back/stores/nbackStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));
vi.mock('@api/stats', () => ({
  fetchNBackSessionStats: vi.fn(),
}));

describe('NBackSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.NBackSessionWithResults.createFrom({
    id: 1,
    gameCode: 'N_BACK',
    playDatetime: '2023-10-27T10:00:00Z',
    settings: JSON.stringify({ numTrials: 2, nBackLevel: 1, presentationTime: 1000, shapeGroup: 'group1', isRealMode: false }), // Changed to JSON string
    results: [
      { id: 1, sessionId: 1, questionNum: 1, round: 1, playerChoice: 'LEFT', correctChoice: 'LEFT', isCorrect: true, responseTimeMs: 500 },
      { id: 2, sessionId: 1, questionNum: 2, round: 1, playerChoice: 'RIGHT', correctChoice: 'LEFT', isCorrect: false, responseTimeMs: 600 },
    ],
  });

  const mockNBackSessionStats: NBackSessionStats = {
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
        nBackLevelStats: [],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchNBackSessionStats as vi.Mock).mockResolvedValue(mockNBackSessionStats);
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useNBackStore as vi.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/n-back/${sessionId}`]}>
        <Routes>
          <Route path="/records/n-back/:sessionId" element={<NBackSessionDetail />} />
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
    (fetchNBackSessionStats as vi.Mock).mockRejectedValueOnce(new Error('Stats fetch failed'));
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
    expect(await screen.findByText('세션을 찾을 수 없습니다. 목록에서 다른 세션을 선택해주세요.')).toBeInTheDocument();
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

    // Check for charts
    // There are 2 charts for round stats, and potentially 2 more for nBackLevelStats if round 2 exists
    // For mockNBackSessionStats, only round 1 is present, so 2 charts for round 1 accuracy/response time
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);

    // Check for results table
    expect(await screen.findByText('라운드별 상세 기록')).toBeInTheDocument();
    expect(await screen.findAllByRole('cell', { name: 'LEFT' })).toHaveLength(3); // Three 'LEFT' choices
    expect(await screen.findByRole('cell', { name: 'RIGHT' })).toBeInTheDocument(); // One 'RIGHT' choice
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

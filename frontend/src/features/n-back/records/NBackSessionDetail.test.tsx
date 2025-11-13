import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NBackSessionDetail } from './NBackSessionDetail';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/n-back/stores/nbackStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));

describe('NBackSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.NBackSessionWithResults.createFrom({
    id: 1,
    gameCode: 'N_BACK',
    playDatetime: '2023-10-27T10:00:00Z',
    settings: { numTrials: 2, nBackLevel: 1, presentationTime: 1000, shapeGroup: 'group1', isRealMode: false },
    results: [
      { questionNum: 1, round: 1, playerChoice: 'MATCH', correctChoice: 'MATCH', isCorrect: true, responseTimeMs: 500 },
      { questionNum: 2, round: 1, playerChoice: 'NO_MATCH', correctChoice: 'MATCH', isCorrect: false, responseTimeMs: 600 },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useNBackStore as jest.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/n-back/${sessionId}`]}>
        <Routes>
          <Route path="/records/n-back/:sessionId" element={<NBackSessionDetail />} />
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
    expect(screen.getByText('세션을 찾을 수 없습니다. 목록에서 다른 세션을 선택해주세요.')).toBeInTheDocument();
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
    expect(screen.getByText('라운드별 상세 기록')).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'MATCH' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('cell', { name: 'NO_MATCH' })).toBeInTheDocument();
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

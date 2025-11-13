import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { NumberPressingSessionDetail } from './NumberPressingSessionDetail';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/number-pressing/stores/numberPressingStore');
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart" />,
}));

describe('NumberPressingSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.NumberPressingSessionWithResults.createFrom({
    id: 1,
    gameCode: 'NUMBER_PRESSING',
    playDatetime: '2023-10-29T10:00:00Z',
    settings: { rounds: [1, 2], problemsPerRound: 1, timeLimitR1: 30, timeLimitR2: 60, isRealMode: false },
    results: {
      resultsR1: [
        { problem: { targetNumber: 5 }, isCorrect: true, timeTaken: 1.2 },
      ],
      resultsR2: [
        { problem: { doubleClick: [3], skip: [7] }, playerClicks: [1,2,3,3,4,5,6,8,9], correctClicks: [1,2,3,3,4,5,6,8,9], isCorrect: true, timeTaken: 15.5 },
      ],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useNumberPressingStore as jest.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/number-pressing/${sessionId}`]}>
        <Routes>
          <Route path="/records/number-pressing/:sessionId" element={<NumberPressingSessionDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state', () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: true,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('세션 상세 정보를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders "session not found" message', () => {
    renderComponent('2', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('세션을 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders session details when session is found', () => {
    renderComponent('1', {
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });

    // Check title and summary
    expect(screen.getByText('세션 상세 기록 (ID: 1)')).toBeInTheDocument();
    expect(screen.getByText('총 문제 수: 2')).toBeInTheDocument();
    expect(screen.getByText('정답 수: 2')).toBeInTheDocument();
    expect(screen.getByText('전체 정확도: 100.00%')).toBeInTheDocument();

    // Check for charts
    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2);

    // Check for results tables
    expect(screen.getByText('1라운드 상세 기록')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '5' })).toBeInTheDocument();
    expect(screen.getByText('2라운드 상세 기록')).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: '1, 2, 3, 3, 4, 5, 6, 8, 9' })).toHaveLength(2);
  });
});

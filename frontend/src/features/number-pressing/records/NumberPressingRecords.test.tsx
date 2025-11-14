import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NumberPressingRecords } from './NumberPressingRecords';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/number-pressing/stores/numberPressingStore');
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}));
vi.mock('@components/common/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

describe('NumberPressingRecords component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.NumberPressingSessionWithResults.createFrom({
    id: 1,
    gameCode: 'NUMBER_PRESSING',
    playDatetime: '2023-10-29T10:00:00Z',
    settings: JSON.stringify({ rounds: [1], problemsPerRound: 2, timeLimitR1: 30, timeLimitR2: 60, isRealMode: false }),
    results: {
      resultsR1: [{ problem: { targetNumber: 1 }, isCorrect: true, timeTaken: 1.5 }],
      resultsR2: [],
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (storeState: any) => {
    (useNumberPressingStore as jest.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter>
        <NumberPressingRecords />
      </MemoryRouter>
    );
  };

  it('calls fetchPaginatedSessions on initial render', () => {
    renderComponent({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(mockFetchPaginatedSessions).toHaveBeenCalledWith(1, 10);
  });

  it('renders loading state', () => {
    renderComponent({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: true,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    renderComponent({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: 'Failed to fetch records',
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('Failed to fetch records')).toBeInTheDocument();
  });

  it('renders "no records" message when there are no sessions', () => {
    renderComponent({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    expect(screen.getByText('표시할 기록이 없습니다.')).toBeInTheDocument();
  });

  it('renders the records chart and pagination when sessions are available', () => {
    renderComponent({
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });

    expect(screen.getByText('숫자 누르기 게임 기록')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});

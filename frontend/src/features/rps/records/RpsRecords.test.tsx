import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RpsRecords } from './RpsRecords';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/rps/stores/rpsStore');
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}));
vi.mock('@components/common/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

describe('RpsRecords component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.RpsSessionWithResults.createFrom({
    id: 1,
    gameCode: 'RPS',
    playDatetime: '2023-10-28T10:00:00Z',
    settings: { rounds: [1], questionsPerRound: 2, timeLimitMs: 1000, isRealMode: false },
    results: [
      { questionNum: 1, round: 1, playerChoice: 'ROCK', correctChoice: 'ROCK', isCorrect: true, responseTimeMs: 500 },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (storeState: any) => {
    (useRpsStore as jest.Mock).mockReturnValue(storeState);
    return render(
      <MemoryRouter>
        <RpsRecords />
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

    expect(screen.getByText('가위바위보 게임 기록')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});

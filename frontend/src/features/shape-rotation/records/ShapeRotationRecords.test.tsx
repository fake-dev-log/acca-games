import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ShapeRotationRecords } from './ShapeRotationRecords';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/shape-rotation/stores/shapeRotationStore');
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}));
vi.mock('@components/common/Pagination', () => ({
  Pagination: () => <div data-testid="pagination" />,
}));

describe('ShapeRotationRecords component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.ShapeRotationSessionWithResults.createFrom({
    id: 1,
    gameCode: 'SHAPE_ROTATION',
    playDatetime: '2023-10-30T10:00:00Z',
    settings: { round: 1, numProblems: 2, timeLimit: 180, isRealMode: false },
    results: [
      { problem: { InitialShape: 'F', FinalShape: 'G', MinMoves: 1 }, isCorrect: true, solveTime: 10, clickCount: 1, userSolution: ['rotate_left_45'] },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (storeState: any) => {
    (useShapeRotationStore as any).mockReturnValue(storeState);
    return render(
      <MemoryRouter>
        <ShapeRotationRecords />
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

    expect(screen.getByText('도형 회전하기 게임 기록')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });
});

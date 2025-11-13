import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ShapeRotationSessionDetail } from './ShapeRotationSessionDetail';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import { types } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/shape-rotation/stores/shapeRotationStore');

describe('ShapeRotationSessionDetail component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  const mockSession = types.ShapeRotationSessionWithResults.createFrom({
    id: 1,
    gameCode: 'SHAPE_ROTATION',
    playDatetime: '2023-10-30T10:00:00Z',
    settings: { round: 1, numProblems: 1, timeLimit: 180, isRealMode: false },
    results: [
      { problemId: 1, isCorrect: true, solveTime: 10000, clickCount: 5, userSolution: ['rotate_left_45'] },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (sessionId: string, storeState: any) => {
    (useShapeRotationStore as any).mockReturnValue(storeState);
    return render(
      <MemoryRouter initialEntries={[`/records/shape-rotation/${sessionId}`]}>
        <Routes>
          <Route path="/records/shape-rotation/:sessionId" element={<ShapeRotationSessionDetail />} />
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
    expect(screen.getByText('총 문제 수: 1')).toBeInTheDocument();
    expect(screen.getByText('정답 수: 1')).toBeInTheDocument();
    expect(screen.getByText('전체 정확도: 100.00%')).toBeInTheDocument();
    expect(screen.getByText('평균 풀이 시간: 10.00 초')).toBeInTheDocument();
    expect(screen.getByText('평균 클릭 수: 5.00')).toBeInTheDocument();

    // Check for results table
    expect(screen.getByText('상세 기록')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '10.00' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'rotate_left_45' })).toBeInTheDocument();
  });
});

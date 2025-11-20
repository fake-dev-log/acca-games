import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CountComparisonSessionDetail } from './CountComparisonSessionDetail';
import { useCountComparisonStore } from '../stores/countComparisonStore';
import { fetchCountComparisonSessionStats } from '@api/stats';
import { types } from '@wails/go/models';

vi.mock('../stores/countComparisonStore');
vi.mock('@api/stats');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
    };
});

const mockSession: types.CountComparisonSessionWithResults = types.CountComparisonSessionWithResults.createFrom({
    id: 1,
    game_code: 'count_comparison',
    play_datetime: '2023-10-27T10:00:00Z',
    settings: JSON.stringify({ numProblems: 10, presentationTime: 1000 }),
    results: [],
});

const mockStats: types.CountComparisonSessionStats = types.CountComparisonSessionStats.createFrom({
    totalQuestions: 10,
    totalCorrect: 8,
    overallAccuracy: 80,
    averageResponseTimeMs: 500,
    trapStats: [],
});

describe('CountComparisonSessionDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = (sessionId: string) => {
        return render(
            <MemoryRouter initialEntries={[`/records/count-comparison/${sessionId}`]}>
                <Routes>
                    <Route path="/records/count-comparison/:sessionId" element={<CountComparisonSessionDetail />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('displays loading state initially', () => {
        (useCountComparisonStore as any).mockReturnValue({
            paginatedSessions: { sessions: [], totalCount: 0 },
            loading: true,
            fetchPaginatedSessions: vi.fn(),
        });
        (fetchCountComparisonSessionStats as any).mockResolvedValue(mockStats);

        renderComponent('1');
        expect(screen.getByText('세션 상세 정보를 불러오는 중...')).toBeInTheDocument();
    });

    it('displays error state', async () => {
        (useCountComparisonStore as any).mockReturnValue({
            paginatedSessions: { sessions: [], totalCount: 0 },
            loading: false,
            error: 'Failed to fetch sessions',
            fetchPaginatedSessions: vi.fn(),
        });
        (fetchCountComparisonSessionStats as any).mockRejectedValue(new Error('Stats fetch failed'));
        renderComponent('1');

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch sessions')).toBeInTheDocument();
        });
    });

    it('displays session details when data is loaded', async () => {
        (useCountComparisonStore as any).mockReturnValue({
            paginatedSessions: { sessions: [mockSession], totalCount: 1 },
            loading: false,
            error: null,
            fetchPaginatedSessions: vi.fn(),
        });
        (fetchCountComparisonSessionStats as any).mockResolvedValue(mockStats);

        renderComponent('1');

        await waitFor(() => {
            expect(screen.getByText('총 문제 수: 10')).toBeInTheDocument();
            expect(screen.getByText('정답 수: 8')).toBeInTheDocument();
        });
    });

    it('fetches sessions if not available in store', () => {
        const fetchPaginatedSessions = vi.fn();
        (useCountComparisonStore as any).mockReturnValue({
            paginatedSessions: { sessions: [], totalCount: 0 },
            loading: false,
            error: null,
            fetchPaginatedSessions,
        });
        (fetchCountComparisonSessionStats as any).mockResolvedValue(mockStats);

        renderComponent('1');
        expect(fetchPaginatedSessions).toHaveBeenCalledWith(1, 10);
    });
});

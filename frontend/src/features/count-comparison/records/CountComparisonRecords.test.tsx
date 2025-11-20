import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { create, useStore } from 'zustand';
import { MemoryRouter } from 'react-router-dom';
import { CountComparisonRecords } from './CountComparisonRecords';
import { useCountComparisonStore } from '../stores/countComparisonStore';
import { types } from '@wails/go/models';

const mockStore = create<any>((set) => ({
  paginatedSessions: { sessions: [], totalCount: 0 },
  loading: false,
  error: null,
  fetchPaginatedSessions: vi.fn(),
}));

vi.mock('../stores/countComparisonStore', () => ({
  useCountComparisonStore: (selector: any) => useStore(mockStore, selector),
}));

vi.mock('@components/records/GameRecordsDashboard', () => ({
  GameRecordsDashboard: ({ useStoreHook, gameTitle }: { useStoreHook: any, gameTitle: string }) => {
    const { loading, error } = useStoreHook();
    return (
      <div>
        <h1>{gameTitle}</h1>
        {loading && <p>기록을 불러오는 중...</p>}
        {error && <p>{error}</p>}
      </div>
    );
  },
}));

describe('CountComparisonRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      mockStore.setState({
        paginatedSessions: { sessions: [], totalCount: 0 },
        loading: false,
        error: null,
        fetchPaginatedSessions: vi.fn(),
      });
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('displays loading state', () => {
    act(() => {
      mockStore.setState({ loading: true });
    });
    renderWithRouter(<CountComparisonRecords />);
    expect(screen.getByText('기록을 불러오는 중...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    act(() => {
      mockStore.setState({ error: 'Failed to fetch sessions' });
    });
    renderWithRouter(<CountComparisonRecords />);
    expect(screen.getByText('Failed to fetch sessions')).toBeInTheDocument();
  });

  it('renders the dashboard with the correct title', () => {
    renderWithRouter(<CountComparisonRecords />);
    expect(screen.getByText('개수 비교하기 기록')).toBeInTheDocument();
  });
});

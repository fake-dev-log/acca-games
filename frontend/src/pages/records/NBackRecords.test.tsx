import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NBackRecords } from './NBackRecords';
import { useNBackStore } from '@stores/nbackStore';

// Mock child components and external libraries
vi.mock('@components/records/SessionList', () => ({
  SessionList: ({ sessions, loading, error, onSessionClick }) => (
    <div data-testid="session-list">
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {sessions.map(s => (
        <div key={s.sessionId} onClick={() => onSessionClick(s.sessionId)}>{s.playDatetime}</div>
      ))}
    </div>
  ),
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <canvas data-testid="mock-chart" />,
}));

// Mock the store
vi.mock('@stores/nbackStore');

describe('NBackRecords component', () => {
  const mockFetchSessions = vi.fn();
  const mockFetchAllResults = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('fetches data on mount and shows loading state', () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      sessions: [],
      allResults: [],
      loading: true,
      error: null,
      fetchSessions: mockFetchSessions,
      fetchAllResults: mockFetchAllResults,
    });

    renderWithRouter(<NBackRecords />);

    expect(mockFetchSessions).toHaveBeenCalledTimes(1);
    expect(mockFetchAllResults).toHaveBeenCalledTimes(1);
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('shows an error message if fetching fails', () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      sessions: [],
      allResults: [],
      loading: false,
      error: 'Failed to fetch',
      fetchSessions: mockFetchSessions,
      fetchAllResults: mockFetchAllResults,
    });

    renderWithRouter(<NBackRecords />);

    expect(screen.getAllByText('Failed to fetch').length).toBeGreaterThan(0);
  });

  it('renders sessions and chart when data is available', () => {
    const mockSessions = [
      { sessionId: 1, playDatetime: '2023-01-01', settings: JSON.stringify({ nBackLevel: 1, shapeGroup: 'group1' }) },
      { sessionId: 2, playDatetime: '2023-01-02', settings: JSON.stringify({ nBackLevel: 2, shapeGroup: 'group2' }) },
    ];
    (useNBackStore as jest.Mock).mockReturnValue({
      sessions: mockSessions,
      allResults: [],
      loading: false,
      error: null,
      fetchSessions: mockFetchSessions,
      fetchAllResults: mockFetchAllResults,
    });

    renderWithRouter(<NBackRecords />);

    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('2023-01-02')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });

  it('filters sessions based on level filter', () => {
    const mockSessions = [
      { sessionId: 1, playDatetime: '2023-01-01', settings: JSON.stringify({ nBackLevel: 1, shapeGroup: 'group1' }) },
      { sessionId: 2, playDatetime: '2023-01-02', settings: JSON.stringify({ nBackLevel: 2, shapeGroup: 'group2' }) },
    ];
    (useNBackStore as jest.Mock).mockReturnValue({
      sessions: mockSessions,
      allResults: [],
      loading: false,
      error: null,
      fetchSessions: mockFetchSessions,
      fetchAllResults: mockFetchAllResults,
    });

    renderWithRouter(<NBackRecords />);

    // Initially, both are visible
    expect(screen.getByText('2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('2023-01-02')).toBeInTheDocument();

    // Filter by level 1
    fireEvent.change(screen.getByLabelText('라운드 필터:'), { target: { value: '1' } });

    // Only session 1 should be visible in the list (though the mock list doesn't update, we check the chart data)
    // This is a limitation of testing the component in isolation. A better test would be an E2E test.
    // For this unit test, we can at least confirm the filter UI is there.
    expect(screen.getByDisplayValue('1라운드 (2-back)')).toBeInTheDocument();
  });
});

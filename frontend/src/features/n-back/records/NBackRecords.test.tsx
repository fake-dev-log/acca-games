import { ReactElement } from "react";
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NBackRecords } from './NBackRecords';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { types } from '@wails/go/models';

vi.mock('@features/n-back/stores/nbackStore');

describe('NBackRecords component', () => {
  const mockFetchPaginatedSessions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNBackStore as jest.Mock).mockReturnValue({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
  });

  const renderWithRouter = (ui: ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('calls fetchPaginatedSessions on initial render', () => {
    renderWithRouter(<NBackRecords />);
    expect(mockFetchPaginatedSessions).toHaveBeenCalledWith(1, 10);
  });

  it('displays loading state', () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: true,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    renderWithRouter(<NBackRecords />);
    expect(screen.getByText('세션 목록을 불러오는 중...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      paginatedSessions: { sessions: [], totalCount: 0 },
      loading: false,
      error: 'Failed to fetch',
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });
    renderWithRouter(<NBackRecords />);
    expect(screen.getByText('세션 목록을 불러오지 못했습니다.')).toBeInTheDocument();
  });

  it('displays session list when sessions are loaded', async () => {
    const mockSession = types.NBackSessionWithResults.createFrom({
      id: 1,
      play_datetime: '2023-10-27T10:00:00Z',
      settings: JSON.stringify({ numTrials: 20, nBackLevel: 1, presentationTime: 1000, shapeGroup: 'group1', isRealMode: false }), // Updated to JSON string with full settings
      results: [
        { isCorrect: true, responseTimeMs: 500 },
        { isCorrect: false, responseTimeMs: 600 },
      ],
    });

    (useNBackStore as jest.Mock).mockReturnValue({
      paginatedSessions: { sessions: [mockSession], totalCount: 1 },
      loading: false,
      error: null,
      fetchPaginatedSessions: mockFetchPaginatedSessions,
    });

    renderWithRouter(<NBackRecords />);

    await waitFor(() => {
      expect(screen.getByText('세션 ID: 1')).toBeInTheDocument();
    });
  });
});

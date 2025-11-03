import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { NBackGameSetup } from './NBackGameSetup';
import { useNBackStore } from '@stores/nbackStore';
import { getShapeGroups } from '@api/nback';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: vi.fn() };
});
vi.mock('@stores/nbackStore');
vi.mock('@api/nback');

describe('NBackGameSetup component', () => {
  const mockNavigate = vi.fn();
  const mockStartGame = vi.fn();
  const mockResetGameState = vi.fn();
  const mockGetShapeGroups = getShapeGroups as jest.Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: null,
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGameState: mockResetGameState,
    });
    mockGetShapeGroups.mockResolvedValue({ 'group1': ['circle', 'square'] });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders form elements with default values', async () => {
    await act(async () => {
      renderWithRouter(<NBackGameSetup />);
    });

    expect(screen.getByLabelText('문제 개수 (10-50)')).toHaveValue(25);
    expect(screen.getByLabelText('도형 제시 시간 (초, 1-10)')).toHaveValue(3);
    expect(screen.getByRole('button', { name: '1라운드 (2-back)' })).toHaveClass('bg-primary-light');
    expect(screen.getByRole('button', { name: '랜덤' })).toHaveClass('bg-indigo-100');
    expect(screen.getByLabelText('실전 모드 (피드백 없음)')).not.toBeChecked();
  });

  it('updates settings on user input', async () => {
    await act(async () => {
      renderWithRouter(<NBackGameSetup />);
    });

    // Change numTrials
    fireEvent.change(screen.getByLabelText('문제 개수 (10-50)'), { target: { value: '30' } });
    expect(screen.getByLabelText('문제 개수 (10-50)')).toHaveValue(30);

    // Change nBackLevel
    fireEvent.click(screen.getByRole('button', { name: '2라운드 (2 & 3-back)' }));
    expect(screen.getByRole('button', { name: '2라운드 (2 & 3-back)' })).toHaveClass('bg-primary-light');

    // Change shapeGroup
    fireEvent.click(screen.getByRole('button', { name: '1번 세트' }));
    expect(screen.getByRole('button', { name: '1번 세트' })).toHaveClass('bg-indigo-100');
  });

  it('calls startGame with correct settings on form submission', async () => {
    await act(async () => {
      renderWithRouter(<NBackGameSetup />);
    });

    // Change some settings
    fireEvent.change(screen.getByLabelText('문제 개수 (10-50)'), { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: '2라운드 (2 & 3-back)' }));

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

    await waitFor(() => {
      expect(mockStartGame).toHaveBeenCalledWith({
        numTrials: 42,
        presentationTime: 3000,
        nBackLevel: 2,
        shapeGroup: 'random', // remains random as we didn't click another group
        isRealMode: false,
      });
    });
  });

  it('navigates to game page when gameState is updated', () => {
    // Initial render without gameState
    const { rerender } = renderWithRouter(<NBackGameSetup />);

    // Mock the store update to provide a gameState
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: { sessionId: 123 }, // a mock gameState object
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGameState: mockResetGameState,
    });

    // Rerender the component with the new store state
    rerender(<MemoryRouter><NBackGameSetup /></MemoryRouter>);

    expect(mockNavigate).toHaveBeenCalledWith('/games/n-back/play');
  });
});

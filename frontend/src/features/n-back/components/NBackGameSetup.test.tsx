import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { NBackGameSetup } from './NBackGameSetup';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { getShapeGroups } from '@api/nback';
import { GameCodeSlugs, GameCodes } from '@constants/gameCodes';
import { nback } from '@wails/go/models';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: vi.fn() };
});
vi.mock('@features/n-back/stores/nbackStore');
vi.mock('@api/nback');

describe('NBackGameSetup component', () => {
  const mockNavigate = vi.fn();
  const mockStartGame = vi.fn();
  const mockResetGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: null,
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGame: mockResetGame,
    });
    (getShapeGroups as jest.Mock).mockResolvedValue({
      group1: ['circle', 'square', 'triangle'],
      group2: ['trapezoid', 'hourglass', 'diamond'],
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };
  it('renders form elements with default values', async () => {
    renderWithRouter(<NBackGameSetup />);
    await waitFor(() => {
      expect(screen.getByText('1번 세트')).toBeInTheDocument();
      expect(screen.getByText(/2개 순서 전/i)).toBeInTheDocument();
      expect(screen.getByLabelText('문제 개수 (10-50)')).toHaveValue(25);
    });
  });

  it('calls startGame with correct settings on form submission', async () => {
    renderWithRouter(<NBackGameSetup />);
    
    await waitFor(() => {
      expect(screen.getByText('1번 세트')).toBeInTheDocument();
    });

    // Change N-Back Level by clicking the button for "3-Back"
    fireEvent.click(screen.getByRole('button', { name: /2개 또는 3개 순서 전/i }));
    fireEvent.change(screen.getByLabelText('문제 개수 (10-50)'), { target: { value: '30' } });

    fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

    await waitFor(() => {
      expect(mockStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          nBackLevel: 2,
          numTrials: 30,
        }),
      );
    });
  });

  it('calls resetGame on unmount', () => {
    const { unmount } = renderWithRouter(<NBackGameSetup />);
    unmount();
    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });
});

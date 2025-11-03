import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { RpsGameSetup } from './RpsGameSetup';
import { useRpsStore } from '@stores/rpsStore';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: vi.fn() };
});
vi.mock('@stores/rpsStore');

describe('RpsGameSetup component', () => {
  const mockNavigate = vi.fn();
  const mockStartGame = vi.fn();
  const mockResetGameState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useRpsStore as jest.Mock).mockReturnValue({
      gameState: null,
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGameState: mockResetGameState,
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders form elements with default values', () => {
    renderWithRouter(<RpsGameSetup />);

    expect(screen.getByLabelText('라운드 선택')).toHaveValue('all');
    expect(screen.getByLabelText('라운드 당 문제 수 (3-30)')).toHaveValue(10);
    expect(screen.getByLabelText('문제별 제한 시간 (초, 0.5-10)')).toHaveValue(3);
    expect(screen.getByLabelText('실전 모드 (피드백 없음)')).not.toBeChecked();
  });

  it('updates settings on user input', () => {
    renderWithRouter(<RpsGameSetup />);

    // Change round
    fireEvent.change(screen.getByLabelText('라운드 선택'), { target: { value: '1' } });
    expect(screen.getByLabelText('라운드 선택')).toHaveValue('1');

    // Change questionsPerRound
    fireEvent.change(screen.getByLabelText('라운드 당 문제 수 (3-30)'), { target: { value: '20' } });
    expect(screen.getByLabelText('라운드 당 문제 수 (3-30)')).toHaveValue(20);
  });

  it('calls startGame with correct settings on form submission', async () => {
    renderWithRouter(<RpsGameSetup />);

    // Change some settings
    fireEvent.change(screen.getByLabelText('라운드 선택'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('라운드 당 문제 수 (3-30)'), { target: { value: '15' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

    await waitFor(() => {
      expect(mockStartGame).toHaveBeenCalledWith({
        rounds: [2],
        questionsPerRound: 15,
        timeLimitMs: 3000,
        isRealMode: false,
      });
    });
  });

  it('navigates to game page when gameState is updated', () => {
    const { rerender } = renderWithRouter(<RpsGameSetup />);

    (useRpsStore as jest.Mock).mockReturnValue({
      gameState: { sessionId: 456 }, // a mock gameState object
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGameState: mockResetGameState,
    });

    rerender(<MemoryRouter><RpsGameSetup /></MemoryRouter>);

    expect(mockNavigate).toHaveBeenCalledWith('/games/rps/play');
  });
});

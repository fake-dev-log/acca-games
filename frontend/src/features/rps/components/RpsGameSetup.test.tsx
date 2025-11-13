import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { RpsGameSetup } from './RpsGameSetup';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { GameCodeSlugs, GameCodes } from '@constants/gameCodes';
import { rps } from '@wails/go/models';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: vi.fn() };
});
vi.mock('@features/rps/stores/rpsStore');

describe('RpsGameSetup component', () => {
  const mockNavigate = vi.fn();
  const mockStartGame = vi.fn();
  const mockResetGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useRpsStore as jest.Mock).mockReturnValue({
      gameState: null,
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGame: mockResetGame,
    });
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders form elements with default values', () => {
    renderWithRouter(<RpsGameSetup />);
    expect(screen.getByRole('button', { name: /모든 라운드/i })).toHaveClass('bg-primary-light');
    expect(screen.getByLabelText('라운드 당 문제 수 (3-30)')).toHaveValue(10);
    expect(screen.getByLabelText('문제별 제한 시간 (초, 0.5-10)')).toHaveValue(3);
  });

  it('updates settings on user input', () => {
    renderWithRouter(<RpsGameSetup />);

    fireEvent.click(screen.getByRole('button', { name: /'나'의 입장에서 선택/i }));
    expect(screen.getByRole('button', { name: /'나'의 입장에서 선택/i })).toHaveClass('bg-primary-light');
    
    fireEvent.change(screen.getByLabelText('라운드 당 문제 수 (3-30)'), { target: { value: '20' } });
    expect(screen.getByLabelText('라운드 당 문제 수 (3-30)')).toHaveValue(20);
  });

  it('calls startGame with correct settings on form submission', async () => {
    renderWithRouter(<RpsGameSetup />);

    fireEvent.click(screen.getByRole('button', { name: "2라운드 '상대'의 입장에서 선택" }));
    fireEvent.change(screen.getByLabelText('라운드 당 문제 수 (3-30)'), { target: { value: '15' } });

    fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

    await waitFor(() => {
      expect(mockStartGame).toHaveBeenCalledWith(
        expect.objectContaining({
          rounds: [2],
          questionsPerRound: 15,
        }),
      );
    });
  });

  it('calls resetGame on unmount', () => {
    const { unmount } = renderWithRouter(<RpsGameSetup />);
    unmount();
    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });
});

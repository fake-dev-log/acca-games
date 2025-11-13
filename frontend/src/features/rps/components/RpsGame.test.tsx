import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { RpsGame } from './RpsGame';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { rps } from '@wails/go/models';
import { GameCodes } from '@constants/gameCodes';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: vi.fn() };
});
vi.mock('@features/rps/stores/rpsStore');

describe('RpsGame component', () => {
  const mockNavigate = vi.fn();
  const mockSubmitAnswer = vi.fn();
  const mockResetGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useRpsStore as jest.Mock).mockReturnValue({
      gameState: null,
      submitAnswer: mockSubmitAnswer,
      resetGame: mockResetGame,
      setGameMode: vi.fn(),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  const mockGameState: rps.GameState = {
    settings: {
      rounds: [1],
      questionsPerRound: 2,
      timeLimitMs: 1000,
      isRealMode: false,
    },
    problems: [
      { round: 1, questionNum: 1, problemCardHolder: 'me', givenCard: 'ROCK', correctChoice: 'PAPER' },
      { round: 1, questionNum: 2, problemCardHolder: 'opponent', givenCard: 'PAPER', correctChoice: 'ROCK' },
    ],
    id: 1,
    gameCode: GameCodes.RPS,
  };

  it('renders loading state if gameState is null', () => {
    renderWithRouter(<RpsGame />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game UI when gameState is present', () => {
    (useRpsStore as jest.Mock).mockReturnValue({ gameState: mockGameState });
    renderWithRouter(<RpsGame />);

    expect(screen.getByText('나는 항상 이겨야 합니다.')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByText('진행: 1 / 2')).toBeInTheDocument();
  });
});

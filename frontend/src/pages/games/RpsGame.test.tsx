import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { RpsGame } from './RpsGame';
import { useRpsStore } from '@stores/rpsStore';
import { rps, types } from '@wails/go/models';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: vi.fn() };
});
vi.mock('@stores/rpsStore');

describe('RpsGame component', () => {
  const mockNavigate = vi.fn();
  const mockSubmitAnswer = vi.fn();
  const mockResetGameState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useRpsStore as jest.Mock).mockReturnValue({
      gameState: null,
      submitAnswer: mockSubmitAnswer,
      resetGameState: mockResetGameState,
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
      { problemCardHolder: 'me', givenCard: 'ROCK', round: 1 },
      { problemCardHolder: 'opponent', givenCard: 'PAPER', round: 1 },
    ],
    sessionId: 1,
import { GameCodes } from '@constants/gameCodes';
// ... other imports

// ... inside the test
    gameCode: GameCodes.RPS,
  };

  it('renders loading state if gameState is null', () => {
    renderWithRouter(<RpsGame />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game UI when gameState is present', () => {
    (useRpsStore as jest.Mock).mockReturnValue({ ...useRpsStore(), gameState: mockGameState });
    renderWithRouter(<RpsGame />);

    expect(screen.getByText('나는 항상 이겨야 합니다.')).toBeInTheDocument();
    expect(screen.getByText('VS')).toBeInTheDocument();
    expect(screen.getByText('진행: 1 / 2')).toBeInTheDocument();
  });
});

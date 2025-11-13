import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NumberPressingGame } from './NumberPressingGame';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';
import { types } from '@wails/go/models';
import * as App from '@wails/go/main/App';

// Mock dependencies
vi.mock('@features/number-pressing/stores/numberPressingStore');
vi.mock('@wails/go/main/App', () => ({
  CalculateCorrectClicksR2: vi.fn(),
}));

describe('NumberPressingGame component', () => {
  const mockSetGameMode = vi.fn();
  const mockResetGame = vi.fn();
  const mockSubmitAnswerR1 = vi.fn();
  const mockSubmitAnswerR2 = vi.fn();

  const mockGameState = {
    id: 1,
    setup: types.NumberPressingSetup.createFrom({
      isRealMode: false,
      rounds: [1],
      problemsPerRound: 2,
      timeLimitR1: 30,
      timeLimitR2: 60,
    }),
    problemsR1: [
      types.NumberPressingProblemR1.createFrom({ targetNumber: 5 }),
      types.NumberPressingProblemR1.createFrom({ targetNumber: 8 }),
    ],
    problemsR2: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useNumberPressingStore as jest.Mock).mockReturnValue({
      gameState: null,
      gameMode: 'game',
      setGameMode: mockSetGameMode,
      resetGame: mockResetGame,
      submitAnswerR1: mockSubmitAnswerR1,
      submitAnswerR2: mockSubmitAnswerR2,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (state: any) => {
    (useNumberPressingStore as jest.Mock).mockReturnValue(state);
    return render(
      <MemoryRouter>
        <NumberPressingGame />
      </MemoryRouter>
    );
  };

  it('renders loading state if gameState is null', () => {
    const state = useNumberPressingStore();
    renderComponent({ ...state, gameState: null });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows ready screen for round 1 and starts after a delay', async () => {
    const state = useNumberPressingStore();
    renderComponent({ ...state, gameState: mockGameState });

    // Ready screen
    expect(screen.getByText('라운드 1 준비')).toBeInTheDocument();

    // Advance timer to start the game
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Now in "playing" state
    expect(screen.getByText('활성화된 숫자를 누르세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toHaveClass('border-primary-light');
  });

  it('handles a correct answer in Round 1', async () => {
    const state = useNumberPressingStore();
    renderComponent({ ...state, gameState: mockGameState });

    // Start the game
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Click the correct button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '5' }));
    });

    // Check for feedback
    expect(screen.getByText('✓')).toBeInTheDocument();
    expect(mockSubmitAnswerR1).toHaveBeenCalledWith(expect.objectContaining({ isCorrect: true }));

    // Advance to next problem
    await act(async () => {
      vi.advanceTimersByTime(800); // Feedback duration
    });
    expect(screen.getByRole('button', { name: '8' })).toHaveClass('border-primary-light');
  });

  it('handles an incorrect answer in Round 1', async () => {
    const state = useNumberPressingStore();
    renderComponent({ ...state, gameState: mockGameState });

    // Start the game
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Click an incorrect button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '3' }));
    });

    // Check for feedback
    expect(screen.getByText('✗')).toBeInTheDocument();
    expect(mockSubmitAnswerR1).toHaveBeenCalledWith(expect.objectContaining({ isCorrect: false }));
  });

  it('ends the round when time runs out', async () => {
    const state = useNumberPressingStore();
    renderComponent({ ...state, gameState: mockGameState });

    // Start the game
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    // Advance time to trigger timeout
    await act(async () => {
      vi.advanceTimersByTime(mockGameState.setup.timeLimitR1 * 1000);
    });

    expect(screen.getByText('라운드 1 종료')).toBeInTheDocument();
  });
});

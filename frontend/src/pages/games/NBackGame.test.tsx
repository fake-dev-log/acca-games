import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { NBackGame } from './NBackGame';
import { useNBackStore } from '@stores/nbackStore';
import { nback, types } from '@wails/go/models';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: vi.fn(),
  };
});

// Mock the store
vi.mock('@stores/nbackStore');

// Mock child components
vi.mock('@components/shapes/nback/Circle', () => ({ Circle: () => <div data-testid="circle-shape" /> }));
vi.mock('@components/shapes/nback/Square', () => ({ Square: () => <div data-testid="square-shape" /> }));
vi.mock('@components/common/ProgressBar', () => ({ ProgressBar: () => <div data-testid="progress-bar" /> }));
vi.mock('@components/common/Card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
}));

describe('NBackGame component', () => {
  const mockNavigate = vi.fn();
  const mockSubmitAnswer = vi.fn();
  const mockResetGameState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useNBackStore as jest.Mock).mockReturnValue({
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

  const mockGameState: nback.NBackGameState = {
    settings: {
      numTrials: 3,
      presentationTime: 1000,
      nBackLevel: 1,
      shapeGroup: 'group1',
      isRealMode: false,
    },
    shapeSequence: ['circle', 'square', 'circle'],
    sessionId: 1,
  };

  const renderGameComponent = async () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: mockGameState,
      submitAnswer: mockSubmitAnswer,
      resetGameState: mockResetGameState,
    });
    let renderResult;
    await act(async () => {
      renderResult = renderWithRouter(<NBackGame />);
    });
    return renderResult;
  };

  it('renders loading state if gameState is null', () => {
    renderWithRouter(<NBackGame />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game UI when gameState is present', async () => {
    await renderGameComponent();

    expect(screen.getByText(/2칸 앞 도형과 같으면/i)).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('circle-shape')).toBeInTheDocument(); // First shape in sequence
    expect(screen.getByText('진행: 1 / 3')).toBeInTheDocument();
  });

  it('calls submitAnswer with MISS if no input is given within presentationTime', async () => {
    await renderGameComponent();

    // Advance timers to trigger the MISS submission for trial 2
    await act(async () => {
      vi.runAllTimersAsync();
    });

    expect(mockSubmitAnswer).toHaveBeenCalledWith('MISS', mockGameState.settings.presentationTime, 2);
  });

  it('navigates to results when game finishes', async () => {
    await renderGameComponent();

    // Advance through all trials
    await act(async () => {
      vi.runAllTimersAsync();
    });

    expect(screen.getByText('게임 종료!')).toBeInTheDocument();
    expect(screen.getByText(/정확도:/i)).toBeInTheDocument();
  });

  it('calls resetGameState and navigates to /games on exit', async () => {
    await renderGameComponent();

    fireEvent.click(screen.getByRole('button', { name: /나가기/i }));

    expect(mockResetGameState).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/games');
  });
});

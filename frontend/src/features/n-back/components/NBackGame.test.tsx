import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NBackGame } from './NBackGame';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { nback } from '@wails/go/models';

// Mock the store
vi.mock('@features/n-back/stores/nbackStore');

// Mock child components
vi.mock('@components/common/ProgressBar', () => ({ ProgressBar: () => <div data-testid="progress-bar" /> }));
vi.mock('@components/layout/GameLayout', () => ({ 
  GameLayout: ({ children, onExit }) => (
    <div>
      {children}
      <button onClick={onExit}>나가기</button>
    </div>
  )
}));
vi.mock('@components/common/Card', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
}));
// Mock the actual shape components
vi.mock('@components/shapes/nback/Circle', () => ({ Circle: () => <div data-testid="shape-component" /> }));
vi.mock('@components/shapes/nback/Square', () => ({ Square: () => <div data-testid="shape-component" /> }));


describe('NBackGame component', () => {
  const mockSubmitAnswer = vi.fn();
  const mockResetGame = vi.fn();
  const mockSetGameMode = vi.fn();

  const mockGameState: nback.NBackGameState = nback.NBackGameState.createFrom({
    settings: {
      numTrials: 3,
      presentationTime: 1000,
      nBackLevel: 1, // 2-back
      shapeGroup: 'group1',
      isRealMode: false,
    },
    shapeSequence: ['circle', 'square', 'circle'],
    id: 1,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: null,
      submitAnswer: mockSubmitAnswer,
      resetGame: mockResetGame,
      setGameMode: mockSetGameMode,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  const renderGameComponent = async () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: mockGameState,
      submitAnswer: mockSubmitAnswer,
      resetGame: mockResetGame,
      setGameMode: mockSetGameMode,
    });
    await act(async () => {
      renderWithRouter(<NBackGame />);
    });
  };

  it('renders loading state if gameState is null', () => {
    renderWithRouter(<NBackGame />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders game UI when gameState is present', async () => {
    (useNBackStore as jest.Mock).mockReturnValue({
      gameState: mockGameState,
      submitAnswer: mockSubmitAnswer,
      resetGame: mockResetGame,
      setGameMode: mockSetGameMode,
    });
        renderWithRouter(<NBackGame />);
    
        expect(screen.getByText(/2칸 앞 도형과 같으면/i)).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      });

  it('calls resetGame on exit', async () => {
    await renderGameComponent();

    fireEvent.click(screen.getByRole('button', { name: /나가기/i }));

    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });
});

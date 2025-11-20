import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import { create, useStore } from 'zustand';
import CountComparisonPage from './CountComparisonPage';
import { GameMode } from "@constants/gameModes";

// Mock the child components
vi.mock('@features/count-comparison/components/CountComparisonGameSetup', () => ({
  __esModule: true,
  default: () => <div>CountComparisonGameSetup</div>,
}));

vi.mock('@features/count-comparison/components/CountComparisonGame', () => ({
  __esModule: true,
  default: () => <div>CountComparisonGame</div>,
}));

vi.mock('@features/common/components/GameEndPage', () => ({
  __esModule: true,
  GameEndPage: () => <div>GameEndPage</div>,
}));

// Mock the store
const mockStore = create<{
  gameMode: GameMode;
  resetGame: () => void;
  sessionId: number | null;
}>((set) => ({
  gameMode: 'setup',
  resetGame: vi.fn(),
  sessionId: 1,
}));

vi.mock('@features/count-comparison/stores/countComparisonStore', () => ({
  useCountComparisonStore: (selector: any) => useStore(mockStore, selector),
}));

describe('CountComparisonPage', () => {
  beforeEach(() => {
    act(() => {
      mockStore.setState({ gameMode: 'setup', sessionId: 1 });
    });
  });

  it('should render the setup component initially', () => {
    // Arrange
    render(<CountComparisonPage />);

    // Assert
    expect(screen.getByText('CountComparisonGameSetup')).toBeInTheDocument();
  });

  it('should render the game component when game mode is "playing"', () => {
    // Arrange
    render(<CountComparisonPage />);
    act(() => {
      mockStore.setState({ gameMode: 'playing' });
    });

    // Assert
    expect(screen.getByText('CountComparisonGame')).toBeInTheDocument();
  });

  it('should render the game end component when game mode is "result"', () => {
    // Arrange
    render(<CountComparisonPage />);
    act(() => {
      mockStore.setState({ gameMode: 'result' });
    });

    // Assert
    expect(screen.getByText('GameEndPage')).toBeInTheDocument();
  });
});

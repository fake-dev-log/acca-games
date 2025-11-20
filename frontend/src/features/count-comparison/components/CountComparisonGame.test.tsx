import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { create, useStore } from 'zustand';
import { MemoryRouter } from 'react-router-dom';
import CountComparisonGame from './CountComparisonGame';
import { types } from '@wails/go/models';

const mockStore = create<any>((set) => ({
  settings: {
    numProblems: 10,
    presentationTime: 1000,
    inputTime: 3000,
    isRealMode: false,
  },
  currentProblem: null,
  gameMode: 'playing',
  sessionId: 1,
  loading: false,
  error: null,
  setSettings: vi.fn((settings) => set({ settings })),
  startGame: vi.fn(),
  resetGame: vi.fn(),
  fetchNextProblem: vi.fn(),
  submitAnswer: vi.fn(),
}));

vi.mock('../stores/countComparisonStore', () => ({
  useCountComparisonStore: (selector: any) => useStore(mockStore, selector),
}));

vi.mock('@components/common/ProgressBar', () => ({ ProgressBar: () => <div data-testid="progress-bar" /> }));
vi.mock('@components/layout/GameLayout', () => ({ 
  GameLayout: ({ children, onExit }: { children: any, onExit: () => void }) => (
    <div>
      {children}
      <button onClick={onExit}>나가기</button>
    </div>
  )
}));
vi.mock('@components/common/Card', () => ({
  __esModule: true,
  default: ({ children }: { children: any }) => <div data-testid="card">{children}</div>,
}));
vi.mock('./WordCloudDisplay', () => ({
  __esModule: true,
  default: ({ words }: { words: any[] }) => (
    <div data-testid="word-cloud-display">
      {words.filter(w => !w.isGap).map(w => w.text).join(' ')}
    </div>
  ),
}));

describe('CountComparisonGame component', () => {
  const mockProblem: types.CountComparisonProblem = types.CountComparisonProblem.createFrom({
    problemNumber: 1,
    leftWords: [
      types.WordDetail.createFrom({ text: 'wordA', size: 1.0, weight: 400, isGap: false }),
    ],
    rightWords: [
      types.WordDetail.createFrom({ text: 'wordB', size: 1.0, weight: 400, isGap: false }),
    ],
    leftWordText: 'wordA',
    rightWordText: 'wordB',
    density: types.DensityInfo.createFrom({ left: {}, right: {} }),
    presentationTime: 1000,
    inputTime: 3000,
    correctSide: 'right',
    appliedTraps: [],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    act(() => {
      mockStore.setState({
        currentProblem: null,
        gameMode: 'playing',
        loading: false,
        error: null,
        submitAnswer: vi.fn(() => Promise.resolve(true)),
        fetchNextProblem: vi.fn(),
        resetGame: vi.fn(),
        settings: {
          numProblems: 10,
          presentationTime: 1000,
          inputTime: 3000,
          isRealMode: false,
        },
      });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders loading state if currentProblem is null and loading is true', () => {
    act(() => {
      mockStore.setState({ loading: true });
    });
    renderWithRouter(<CountComparisonGame />);
    expect(screen.getByText('문제를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders error state if currentProblem is null and loading is false', () => {
    renderWithRouter(<CountComparisonGame />);
    expect(screen.getByText('오류: 문제 데이터를 찾을 수 없습니다.')).toBeInTheDocument();
  });

  it('renders game UI when currentProblem is present', async () => {
    act(() => {
      mockStore.setState({ currentProblem: mockProblem });
    });
    renderWithRouter(<CountComparisonGame />);

    expect(screen.getByText(/단어의 개수를 기억하세요!/i)).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
  });
  
  it('calls resetGame on exit', async () => {
    const { resetGame } = mockStore.getState();
    renderWithRouter(<CountComparisonGame />);

    fireEvent.click(screen.getByRole('button', { name: /나가기/i }));

    expect(resetGame).toHaveBeenCalledTimes(1);
  });

  it('calls submitAnswer with correct parameters on button click', async () => {
    const { submitAnswer } = mockStore.getState();
    act(() => {
      mockStore.setState({ currentProblem: mockProblem });
    });
    renderWithRouter(<CountComparisonGame />);

    act(() => {
      vi.advanceTimersByTime(1000); // presentation time
    });

    const leftButton = screen.getByRole('button', { name: /wordA/i });
    fireEvent.click(leftButton);

    expect(submitAnswer).toHaveBeenCalledWith(expect.objectContaining({
      playerChoice: 'left',
    }));
  });

  it('advances through presentation and input phases', async () => {
    const { fetchNextProblem, submitAnswer } = mockStore.getState();
    act(() => {
      mockStore.setState({ currentProblem: mockProblem });
    });

    renderWithRouter(<CountComparisonGame />);

    expect(screen.getByText(/단어의 개수를 기억하세요!/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /wordA/i })).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByRole('button', { name: /wordA/i })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(submitAnswer).toHaveBeenCalledWith(expect.objectContaining({
      playerChoice: '',
    }));

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(fetchNextProblem).toHaveBeenCalledTimes(1);
  });
});

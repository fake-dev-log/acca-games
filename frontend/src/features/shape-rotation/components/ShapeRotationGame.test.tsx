import { ReactNode } from "react";
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShapeRotationGame from './ShapeRotationGame';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import * as App from '@wails/go/main/App';
import { shape_rotation } from '@wails/go/models';

// Mock dependencies
vi.mock('@features/shape-rotation/stores/shapeRotationStore');
vi.mock('@wails/go/main/App', () => ({
  SubmitShapeRotationAnswerAsync: vi.fn(),
}));
vi.mock('@components/layout/GameLayout', () => ({ 
  GameLayout: ({ children, onExit }: { children: ReactNode, onExit: () => void }) => (
    <div>
      <button onClick={onExit}>나가기</button>
      {children}
    </div>
  )
}));

describe('ShapeRotationGame component', () => {
  const mockAddTransform = vi.fn();
  const mockUndoTransform = vi.fn();
  const mockClearTransforms = vi.fn();
  const mockNextProblem = vi.fn();
  const mockSetGameMode = vi.fn();
  const mockResetGame = vi.fn();

  const mockProblem: shape_rotation.Problem = {
    InitialShape: 'F',
    FinalShape: 'G',
    MinMoves: 1,
    InitialGridPath: 'M 0 0 L 1 1',
    FinalGridPath: 'M 1 1 L 0 0',
    InitialShapeCenterX: 0.5,
    InitialShapeCenterY: 0.5,
    FinalShapeCenterX: 0.5,
    FinalShapeCenterY: 0.5,
  };

  const defaultStoreState = {
    sessionId: 123,
    settings: { timeLimit: 180, isRealMode: false, round: 1, numProblems: 2 },
    problems: [mockProblem, { ...mockProblem, InitialShape: 'P' }],
    currentProblemIndex: 0,
    userSolution: [],
    clickCount: 0,
    addTransform: mockAddTransform,
    undoTransform: mockUndoTransform,
    clearTransforms: mockClearTransforms,
    nextProblem: mockNextProblem,
    setGameMode: mockSetGameMode,
    resetGame: mockResetGame,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useShapeRotationStore as any).mockReturnValue(defaultStoreState);
    (App.SubmitShapeRotationAnswerAsync as vi.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ShapeRotationGame />
      </MemoryRouter>
    );
  };

  it('renders loading state when there are no problems', () => {
    (useShapeRotationStore as any).mockReturnValue({ ...defaultStoreState, problems: [] });
    renderComponent();
    expect(screen.getByText('문제를 불러오는 중...')).toBeInTheDocument();
  });

  it('renders the initial game layout', async () => {
    renderComponent();
    
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByText('전')).toBeInTheDocument();
    expect(screen.getByText('후')).toBeInTheDocument();
    expect(screen.getByText('나의 풀이 (최소 1번)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /왼쪽 45° 회전/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '답안 제출' })).toBeInTheDocument();
  });

  it('calls addTransform when a transformation button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /좌우 반전/i }));
    expect(mockAddTransform).toHaveBeenCalledWith('flip_horizontal');
  });

  it('calls undoTransform and clearTransforms', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: '하나 지우기' }));
    expect(mockUndoTransform).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '전체 지우기' }));
    expect(mockClearTransforms).toHaveBeenCalledTimes(1);
  });

  it('submits answer and goes to the next problem', async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '답안 제출' }));
    });

    expect(App.SubmitShapeRotationAnswerAsync).toHaveBeenCalled();
    expect(mockNextProblem).toHaveBeenCalledTimes(1);
  });

  it('submits answer and ends the game on the last problem', async () => {
    (useShapeRotationStore as any).mockReturnValue({ ...defaultStoreState, currentProblemIndex: 1 });
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '답안 제출' }));
    });

    expect(App.SubmitShapeRotationAnswerAsync).toHaveBeenCalled();
    expect(mockSetGameMode).toHaveBeenCalledWith('result');
  });

  it('calls handleExit when exit button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: '나가기' }));
    expect(mockResetGame).toHaveBeenCalled();
  });
});

import { useCountComparisonStore } from './countComparisonStore';
import {
  startCountComparisonGame,
  getNextCountComparisonProblem,
  submitCountComparisonAnswer,
  getPaginatedCountComparisonSessionsWithResults,
} from '@api/countComparison';
import { types } from '@wails/go/models';
import { act } from '@testing-library/react';

vi.mock('@api/countComparison');

const mockSettings: types.CountComparisonSettings = types.CountComparisonSettings.createFrom({
  numProblems: 5,
  presentationTime: 500,
  inputTime: 1000,
  isRealMode: false,
});

describe('useCountComparisonStore', () => {
  beforeEach(() => {
    act(() => {
      useCountComparisonStore.getState().resetGame();
    });
    vi.clearAllMocks();
  });

  it('should start a game and fetch the first problem', async () => {
    const mockProblem = { problemNumber: 1 };
    (startCountComparisonGame as any).mockResolvedValue(123);
    (getNextCountComparisonProblem as any).mockResolvedValue(mockProblem);

    await act(async () => {
      await useCountComparisonStore.getState().startGame(mockSettings);
    });

    const state = useCountComparisonStore.getState();
    expect(state.gameMode).toBe('playing');
    expect(state.sessionId).toBe(123);
    expect(state.currentProblem).toEqual(mockProblem);
    expect(state.loading).toBe(false);
  });

  it('should handle errors when starting a game', async () => {
    (startCountComparisonGame as any).mockRejectedValue(new Error('Failed to start'));

    await act(async () => {
      try {
        await useCountComparisonStore.getState().startGame(mockSettings);
      } catch (e) {
        // expected
      }
    });

    const state = useCountComparisonStore.getState();
    expect(state.gameMode).toBe('setup');
    expect(state.error).toBe('Failed to start');
  });

  it('should fetch the next problem', async () => {
    const mockProblem = { problemNumber: 2 };
    (getNextCountComparisonProblem as any).mockResolvedValue(mockProblem);

    await act(async () => {
      await useCountComparisonStore.getState().fetchNextProblem();
    });

    const state = useCountComparisonStore.getState();
    expect(state.currentProblem).toEqual(mockProblem);
    expect(state.gameMode).toBe('setup'); // because it was 'setup' initially
  });

  it('should transition to result mode when there are no more problems', async () => {
    (getNextCountComparisonProblem as any).mockResolvedValue(null);

    await act(async () => {
      await useCountComparisonStore.getState().fetchNextProblem();
    });

    const state = useCountComparisonStore.getState();
    expect(state.currentProblem).toBeNull();
    expect(state.gameMode).toBe('result');
  });

  it('should submit an answer', async () => {
    const submission: types.CountComparisonSubmission = {
      problemNumber: 1,
      playerChoice: 'left',
      responseTimeMs: 500,
    };
    act(() => {
        useCountComparisonStore.setState({ currentProblem: { correctSide: 'left' } as any });
    });
    (submitCountComparisonAnswer as any).mockResolvedValue(undefined);

    let isCorrect;
    await act(async () => {
      isCorrect = await useCountComparisonStore.getState().submitAnswer(submission);
    });

    expect(submitCountComparisonAnswer).toHaveBeenCalledWith(submission);
    expect(isCorrect).toBe(true);
  });

  it('should fetch paginated sessions', async () => {
    const mockSessions = { sessions: [{ id: 1 }], totalCount: 1 };
    (getPaginatedCountComparisonSessionsWithResults as any).mockResolvedValue(mockSessions);

    await act(async () => {
      await useCountComparisonStore.getState().fetchPaginatedSessions(1, 10);
    });

    const state = useCountComparisonStore.getState();
    expect(state.paginatedSessions).toEqual(mockSessions);
  });
});

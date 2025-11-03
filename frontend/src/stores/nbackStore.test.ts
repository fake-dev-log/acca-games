import { useNBackStore } from './nbackStore';
import { vi } from 'vitest';
import { startNBackGame, submitNBackAnswer, getNBackGameSessions } from '@api/nback';
import { types, nback } from '@wails/go/models';
import { act } from '@testing-library/react';

// Mock the API module
vi.mock('@api/nback', () => ({
  startNBackGame: vi.fn(),
  submitNBackAnswer: vi.fn(),
  getNBackGameSessions: vi.fn(),
  getAllNBackResults: vi.fn(),
  getNBackResultsForSession: vi.fn(),
}));

const initialState = useNBackStore.getState();

describe('useNBackStore', () => {
  beforeEach(() => {
    // Reset the store and mocks before each test
    act(() => {
      useNBackStore.setState(initialState);
    });
    vi.clearAllMocks();
  });

  describe('startGame', () => {
    it('should start a game and update the state', async () => {
      const mockSettings: types.NBackSettings = {
        numTrials: 10,
        presentationTime: 1000,
        nBackLevel: 1,
        shapeGroup: 'group1',
        isRealMode: false,
      };

      const mockGameState: nback.NBackGameState = {
        settings: mockSettings,
        shapeSequence: ['circle', 'square'],
        sessionId: 123,
      };

      // Mock the API call
      (startNBackGame as jest.Mock).mockResolvedValue(mockGameState);

      // Get initial state
      const initialState = useNBackStore.getState();
      expect(initialState.loading).toBe(false);
      expect(initialState.gameState).toBeNull();

      // Call the action
      await act(async () => {
        await useNBackStore.getState().startGame(mockSettings);
      });

      // Get updated state
      const updatedState = useNBackStore.getState();

      // Assertions
      expect(startNBackGame).toHaveBeenCalledWith(mockSettings);
      expect(updatedState.loading).toBe(false);
      expect(updatedState.gameState).toEqual(mockGameState);
      expect(updatedState.error).toBeNull();
    });

    it('should handle errors when starting a game', async () => {
      const mockSettings: types.NBackSettings = { numTrials: 10, presentationTime: 1000, nBackLevel: 1, shapeGroup: 'group1', isRealMode: false };

      // Mock the API call to reject
      (startNBackGame as jest.Mock).mockRejectedValue(new Error('Failed to start'));

      // Call the action
      await act(async () => {
        await useNBackStore.getState().startGame(mockSettings);
      });

      // Get updated state
      const updatedState = useNBackStore.getState();

      // Assertions
      expect(updatedState.loading).toBe(false);
      expect(updatedState.gameState).toBeNull();
      expect(updatedState.error).toBe('Failed to start game');
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer and return the result', async () => {
      const mockResult: types.NBackResult = { sessionId: 1, round: 1, questionNum: 1, isCorrect: true, responseTimeMs: 500, playerChoice: 'LEFT', correctChoice: 'LEFT' };
      (submitNBackAnswer as jest.Mock).mockResolvedValue(mockResult);

      let result: types.NBackResult | undefined;
      await act(async () => {
        result = await useNBackStore.getState().submitAnswer('LEFT', 500, 0);
      });

      expect(submitNBackAnswer).toHaveBeenCalledWith('LEFT', 500, 0);
      expect(result).toEqual(mockResult);
      expect(useNBackStore.getState().error).toBeNull();
    });

    it('should handle errors when submitting an answer', async () => {
      (submitNBackAnswer as jest.Mock).mockRejectedValue(new Error('Failed to submit'));

      await act(async () => {
        await useNBackStore.getState().submitAnswer('LEFT', 500, 0);
      });

      expect(useNBackStore.getState().error).toBe('Failed to submit answer');
    });
  });

  describe('resetGameState', () => {
    it('should reset the game state', async () => {
      // First, set a game state
      const mockSettings: types.NBackSettings = { numTrials: 10, presentationTime: 1000, nBackLevel: 1, shapeGroup: 'group1', isRealMode: false };
      const mockGameState: nback.NBackGameState = { settings: mockSettings, shapeSequence: ['circle'], sessionId: 1 };
      (startNBackGame as jest.Mock).mockResolvedValue(mockGameState);
      await act(async () => {
        await useNBackStore.getState().startGame(mockSettings);
      });

      expect(useNBackStore.getState().gameState).not.toBeNull();

      // Now, reset it
      act(() => {
        useNBackStore.getState().resetGameState();
      });

      expect(useNBackStore.getState().gameState).toBeNull();
    });
  });

  describe('fetchSessions', () => {
    it('should fetch sessions and update the state', async () => {
      const mockSessions: types.GameSession[] = [
        { sessionId: 1, gameCode: 'NBACK', playDatetime: '2023-01-01', settings: '' },
        { sessionId: 2, gameCode: 'NBACK', playDatetime: '2023-01-02', settings: '' },
      ];
      (getNBackGameSessions as jest.Mock).mockResolvedValue(mockSessions);

      await act(async () => {
        await useNBackStore.getState().fetchSessions();
      });

      const state = useNBackStore.getState();
      expect(getNBackGameSessions).toHaveBeenCalledTimes(1);
      expect(state.loading).toBe(false);
      expect(state.sessions).toEqual(mockSessions);
      expect(state.error).toBeNull();
    });

    it('should handle errors when fetching sessions', async () => {
      (getNBackGameSessions as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

      await act(async () => {
        await useNBackStore.getState().fetchSessions();
      });

      const state = useNBackStore.getState();
      expect(state.loading).toBe(false);
      expect(state.sessions).toEqual([]);
      expect(state.error).toBe('Failed to fetch sessions');
    });
  });
});

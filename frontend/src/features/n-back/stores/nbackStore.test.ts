import { useNBackStore } from './nbackStore';
import { vi } from 'vitest';
import { getPaginatedNBackSessionsWithResults, startNBackGame, submitNBackAnswer } from '@api/nback';
import { types, nback } from '@wails/go/models';
import { act } from '@testing-library/react';

// Mock the API module
vi.mock('@api/nback', () => ({
  startNBackGame: vi.fn(),
  submitNBackAnswer: vi.fn(),
  getPaginatedNBackSessionsWithResults: vi.fn(),
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
      const mockSettings = types.NBackSettings.createFrom({
        numTrials: 10,
        presentationTime: 1000,
        nBackLevel: 1,
        shapeGroup: 'group1',
        isRealMode: false,
      });

      const mockGameState = nback.NBackGameState.createFrom({
        settings: mockSettings,
        shapeSequence: ['circle', 'square'],
        id: 123,
      });

      (startNBackGame as jest.Mock).mockResolvedValue(mockGameState);

      await act(async () => {
        await useNBackStore.getState().startGame(mockSettings);
      });

      const updatedState = useNBackStore.getState();
      expect(startNBackGame).toHaveBeenCalledWith(mockSettings);
      expect(updatedState.loading).toBe(false);
      expect(updatedState.gameState).toEqual(mockGameState);
      expect(updatedState.sessionId).toBe(123);
      expect(updatedState.error).toBeNull();
    });

    it('should handle errors when starting a game', async () => {
      const mockSettings = types.NBackSettings.createFrom({ numTrials: 10, presentationTime: 1000, nBackLevel: 1, shapeGroup: 'group1', isRealMode: false });
      const error = new Error('Failed to start');
      (startNBackGame as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await useNBackStore.getState().startGame(mockSettings);
      });

      const updatedState = useNBackStore.getState();
      expect(updatedState.loading).toBe(false);
      expect(updatedState.gameState).toBeNull();
      expect(updatedState.error).toBe(error.message);
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer and return the result', async () => {
      const mockResult = types.NBackResult.createFrom({ sessionID: 1, round: 1, questionNum: 1, isCorrect: true, responseTimeMs: 500, playerChoice: 'LEFT', correctChoice: 'LEFT' });
      (submitNBackAnswer as jest.Mock).mockResolvedValue(mockResult);

      let result;
      await act(async () => {
        result = await useNBackStore.getState().submitAnswer('LEFT', 500, 0);
      });

      expect(submitNBackAnswer).toHaveBeenCalledWith('LEFT', 500, 0);
      expect(result).toEqual(mockResult);
    });

    it('should return null when submitting an answer fails', async () => {
      (submitNBackAnswer as jest.Mock).mockRejectedValue(new Error('Failed to submit'));
      console.error = vi.fn(); // Suppress console.error for this test

      let result;
      await act(async () => {
        result = await useNBackStore.getState().submitAnswer('LEFT', 500, 0);
      });
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('resetGame', () => {
    it('should reset the game state', async () => {
      // First, set a game state
      act(() => {
        useNBackStore.setState({ gameState: nback.NBackGameState.createFrom({id: 1}), gameMode: 'playing' });
      });

      expect(useNBackStore.getState().gameState).not.toBeNull();

      // Now, reset it
      act(() => {
        useNBackStore.getState().resetGame();
      });

      expect(useNBackStore.getState().gameState).toBeNull();
      expect(useNBackStore.getState().gameMode).toBe('setup');
    });
  });

  describe('fetchPaginatedSessions', () => {
    it('should fetch sessions and update the state', async () => {
      const mockApiResponse = {
        sessions: [
          { id: 1, game_code: 'NBACK', play_datetime: '2023-01-01', settings: '{"numTrials": 10}' },
        ],
        totalCount: 1,
      };
      (getPaginatedNBackSessionsWithResults as jest.Mock).mockResolvedValue(mockApiResponse);

      await act(async () => {
        await useNBackStore.getState().fetchPaginatedSessions(1, 10);
      });

      const state = useNBackStore.getState();
      expect(getPaginatedNBackSessionsWithResults).toHaveBeenCalledWith(1, 10);
      expect(state.loading).toBe(false);
      expect(state.paginatedSessions.totalCount).toBe(1);
      expect(state.paginatedSessions.sessions[0].id).toBe(1);
      expect(state.paginatedSessions.sessions[0].settings).toEqual({ numTrials: 10 }); // Check for parsed settings
      expect(state.error).toBeNull();
    });

    it('should handle errors when fetching sessions', async () => {
      const error = new Error('Failed to fetch');
      (getPaginatedNBackSessionsWithResults as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await useNBackStore.getState().fetchPaginatedSessions(1, 10);
      });

      const state = useNBackStore.getState();
      expect(state.loading).toBe(false);
      expect(state.paginatedSessions.sessions).toEqual([]);
      expect(state.error).toContain('Failed to fetch paginated sessions');
    });
  });
});

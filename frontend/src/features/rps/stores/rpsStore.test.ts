import { useRpsStore } from './rpsStore';
import { vi } from 'vitest';
import { getPaginatedRpsSessionsWithResults, startRpsGame, submitRpsAnswer } from '@api/rps';
import { types, rps } from '@wails/go/models';
import { act } from '@testing-library/react';
import { GameCodes } from '@constants/gameCodes';

// Mock the API module
vi.mock('@api/rps', () => ({
  startRpsGame: vi.fn(),
  submitRpsAnswer: vi.fn(),
  getPaginatedRpsSessionsWithResults: vi.fn(),
}));

const initialState = useRpsStore.getState();

describe('useRpsStore', () => {
  beforeEach(() => {
    act(() => {
      useRpsStore.setState(initialState);
    });
    vi.clearAllMocks();
  });

  describe('startGame', () => {
    const mockSettings = types.RpsSettings.createFrom({
      rounds: [1],
      questionsPerRound: 5,
      isRealMode: false,
    });

    it('should start a game and update state', async () => {
      const mockGameState = rps.GameState.createFrom({ settings: mockSettings, problems: [], id: 1, gameCode: GameCodes.RPS });
      (startRpsGame as jest.Mock).mockResolvedValue(mockGameState);

      await act(async () => {
        await useRpsStore.getState().startGame(mockSettings);
      });

      const state = useRpsStore.getState();
      expect(startRpsGame).toHaveBeenCalledWith(mockSettings);
      expect(state.loading).toBe(false);
      expect(state.gameState).toEqual(mockGameState);
      expect(state.sessionId).toBe(1);
      expect(state.error).toBeNull();
    });

    it('should handle errors when starting a game', async () => {
      const error = new Error('Failed to start');
      (startRpsGame as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await useRpsStore.getState().startGame(mockSettings);
      });

      const state = useRpsStore.getState();
      expect(state.loading).toBe(false);
      expect(state.gameState).toBeNull();
      expect(state.error).toBe(error.message);
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer and return the result', async () => {
      const mockResult = types.RpsResult.createFrom({ sessionID: 1, round: 1, questionNum: 1, problemCardHolder: 'me', givenCard: 'ROCK', isCorrect: true, responseTimeMs: 500, playerChoice: 'PAPER', correctChoice: 'PAPER' });
      (submitRpsAnswer as jest.Mock).mockResolvedValue(mockResult);

      let result;
      await act(async () => {
        result = await useRpsStore.getState().submitAnswer('PAPER', 500, 1);
      });

      expect(submitRpsAnswer).toHaveBeenCalledWith('PAPER', 500, 1);
      expect(result).toEqual(mockResult);
    });

     it('should return null when submitting an answer fails', async () => {
      (submitRpsAnswer as jest.Mock).mockRejectedValue(new Error('Failed to submit'));
      console.error = vi.fn(); // Suppress console.error for this test

      let result;
      await act(async () => {
        result = await useRpsStore.getState().submitAnswer('PAPER', 500, 1);
      });
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('resetGame', () => {
    it('should reset the game state', async () => {
      act(() => {
        useRpsStore.setState({ gameState: rps.GameState.createFrom({id: 1}), gameMode: 'playing' });
      });
      expect(useRpsStore.getState().gameState).not.toBeNull();

      act(() => {
        useRpsStore.getState().resetGame();
      });

      const state = useRpsStore.getState();
      expect(state.gameState).toBeNull();
      expect(state.gameMode).toBe('setup');
    });
  });

  describe('fetchPaginatedSessions', () => {
    it('should fetch sessions and update the state', async () => {
      const mockApiResponse = {
        sessions: [
          { id: 1, game_code: GameCodes.RPS, play_datetime: '2023-01-01', settings: '{"questionsPerRound": 5}' },
        ],
        totalCount: 1,
      };
      (getPaginatedRpsSessionsWithResults as jest.Mock).mockResolvedValue(mockApiResponse);

      await act(async () => {
        await useRpsStore.getState().fetchPaginatedSessions(1, 10);
      });

      const state = useRpsStore.getState();
      expect(getPaginatedRpsSessionsWithResults).toHaveBeenCalledWith(1, 10);
      expect(state.loading).toBe(false);
      expect(state.paginatedSessions.totalCount).toBe(1);
      expect(state.paginatedSessions.sessions[0].id).toBe(1);
      expect(state.paginatedSessions.sessions[0].settings).toEqual({ questionsPerRound: 5 });
      expect(state.error).toBeNull();
    });
  });
});

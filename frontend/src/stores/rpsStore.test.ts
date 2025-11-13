import { useRpsStore } from './rpsStore';
import { vi } from 'vitest';
import { startRpsGame, submitRpsAnswer, getRpsGameSessions } from '@api/rps';
import { types, rps } from '@wails/go/models';
import { act } from '@testing-library/react';
import { GameCodes } from '@constants/gameCodes';

// Mock the API module
vi.mock('@api/rps', () => ({
  startRpsGame: vi.fn(),
  submitRpsAnswer: vi.fn(),
  getRpsGameSessions: vi.fn(),
  getRpsResultsForSession: vi.fn(),
  getAllRpsResults: vi.fn(),
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
const mockGameState: rps.GameState = { settings: mockSettings, problems: [], id: 1, gameCode: GameCodes.RPS };
      (startRpsGame as jest.Mock).mockResolvedValue(mockGameState);

      await act(async () => {
        await useRpsStore.getState().startGame(mockSettings);
      });

      const state = useRpsStore.getState();
      expect(startRpsGame).toHaveBeenCalledWith(mockSettings);
      expect(state.loading).toBe(false);
      expect(state.gameState).toEqual(mockGameState);
      expect(state.error).toBeNull();
    });
  });

  describe('submitAnswer', () => {
    it('should submit an answer and return the result', async () => {
      const mockResult: types.RpsResult = { sessionId: 1, round: 1, questionNum: 1, problemCardHolder: 'me', givenCard: 'ROCK', isCorrect: true, responseTimeMs: 500, playerChoice: 'PAPER', correctChoice: 'PAPER' };
      (submitRpsAnswer as jest.Mock).mockResolvedValue(mockResult);

      let result: types.RpsResult | undefined;
      await act(async () => {
        result = await useRpsStore.getState().submitAnswer('PAPER', 500, 0);
      });

      expect(submitRpsAnswer).toHaveBeenCalledWith('PAPER', 500, 0);
      expect(result).toEqual(mockResult);
      expect(useRpsStore.getState().error).toBeNull();
    });
  });

  describe('resetGameState', () => {
    it('should reset the game state', async () => {
      // First, set a game state
      const mockSettings: types.RpsSettings = { rounds: [1], questionsPerRound: 5, timeLimitMs: 3000, isRealMode: false };
      const mockGameState: rps.GameState = { settings: mockSettings, problems: [], id: 1, gameCode: GameCodes.RPS };
      (startRpsGame as jest.Mock).mockResolvedValue(mockGameState);
      await act(async () => {
        await useRpsStore.getState().startGame(mockSettings);
      });

      expect(useRpsStore.getState().gameState).not.toBeNull();

      // Now, reset it
      act(() => {
        useRpsStore.getState().resetGameState();
      });

      expect(useRpsStore.getState().gameState).toBeNull();
    });
  });

  describe('fetchSessions', () => {
    it('should fetch sessions and update the state', async () => {
      const mockSessions: types.GameSession[] = [
        { id: 1, gameCode: GameCodes.RPS, playDatetime: '2023-01-01', settings: '' },
      ];
      (getRpsGameSessions as jest.Mock).mockResolvedValue(mockSessions);

      await act(async () => {
        await useRpsStore.getState().fetchSessions();
      });

      const state = useRpsStore.getState();
      expect(getRpsGameSessions).toHaveBeenCalledTimes(1);
      expect(state.loading).toBe(false);
      expect(state.sessions).toEqual(mockSessions);
      expect(state.error).toBeNull();
    });
  });
});

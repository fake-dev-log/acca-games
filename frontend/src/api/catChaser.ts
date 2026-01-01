import { catChaserEngine } from '@features/cat-chaser/logic/CatChaserEngine';
import { CatChaserSettings, CatChaserGameState, CatChaserResult } from '@features/cat-chaser/logic/types';

// Mock types for pagination response since standalone doesn't support persistent records yet
export interface PaginatedCatChaserSessions {
  sessions: any[];
  totalCount: number;
}

export const startCatChaserGame = (
  settings: CatChaserSettings,
): Promise<CatChaserGameState> => {
  return new Promise((resolve) => {
    const gameState = catChaserEngine.startGame(settings);
    resolve(gameState);
  });
};

export const submitCatChaserAnswer = (
  round: number,
  targetColor: 'RED' | 'BLUE', // Adjusted type to match engine
  playerChoice: 'CAUGHT' | 'MISSED' | 'TIMEOUT', // Adjusted type to match engine
  confidence: number,
  responseTimeMs: number,
): Promise<CatChaserResult> => {
  return new Promise((resolve) => {
    const result = catChaserEngine.submitAnswer(
      round,
      targetColor,
      playerChoice,
      confidence,
      responseTimeMs
    );
    resolve(result);
  });
};

export const getPaginatedCatChaserSessionsWithResults = (
  page: number,
  limit: number,
): Promise<PaginatedCatChaserSessions> => {
    // In standalone mode, we don't persist sessions to a DB.
    // Return empty result or implement local storage based persistence if needed.
    return Promise.resolve({
        sessions: [],
        totalCount: 0
    });
};

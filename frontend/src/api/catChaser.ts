import {
  StartCatChaserGame,
  SubmitCatChaserAnswer,
  GetPaginatedCatChaserSessionsWithResults,
} from '@wails/go/main/App';
import { cat_chaser, types } from '@wails/go/models';

export const startCatChaserGame = (
  settings: types.CatChaserSettings,
): Promise<cat_chaser.CatChaserGameState> => {
  return StartCatChaserGame(settings);
};

export const submitCatChaserAnswer = (
  round: number,
  targetColor: string,
  playerChoice: string,
  confidence: number,
  responseTimeMs: number,
): Promise<types.CatChaserResult> => {
  return SubmitCatChaserAnswer(
    round,
    targetColor,
    playerChoice,
    confidence,
    responseTimeMs,
  );
};

export const getPaginatedCatChaserSessionsWithResults = (
  page: number,
  limit: number,
): Promise<types.PaginatedCatChaserSessions> => {
  return GetPaginatedCatChaserSessionsWithResults(page, limit);
};

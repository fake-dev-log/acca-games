import {
  StartRpsGame,
  SubmitRpsAnswer,
  GetPaginatedRpsSessionsWithResults,
} from '@wails/go/main/App';
import { rps, types } from '@wails/go/models';

export const startRpsGame = (
  settings: types.RpsSettings,
): Promise<rps.GameState> => {
  return StartRpsGame(settings);
};

export const submitRpsAnswer = (
  playerChoice: string,
  responseTimeMs: number,
  questionNum: number,
): Promise<types.RpsResult> => {
  return SubmitRpsAnswer(playerChoice, responseTimeMs, questionNum);
};

export const getPaginatedRpsSessionsWithResults = (
  page: number,
  limit: number,
): Promise<types.PaginatedRpsSessions> => {
  return GetPaginatedRpsSessionsWithResults(page, limit);
};

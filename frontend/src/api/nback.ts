import {
  GetPaginatedNBackSessionsWithResults,
  GetShapeGroups,
  StartNBackGame,
  SubmitNBackAnswer,
} from '@wails/go/main/App';
import { nback, types } from '@wails/go/models';

export const getShapeGroups = (): Promise<Record<string, string[]>> => {
  return GetShapeGroups();
};

export const startNBackGame = (
  settings: types.NBackSettings,
): Promise<nback.NBackGameState> => {
  return StartNBackGame(settings);
};

export const submitNBackAnswer = (
  playerChoice: string,
  responseTimeMs: number,
  trialNum: number,
): Promise<types.NBackResult> => {
  return SubmitNBackAnswer(playerChoice, responseTimeMs, trialNum);
};

export const getPaginatedNBackSessionsWithResults = (
  page: number,
  limit: number,
): Promise<types.PaginatedNBackSessions> => {
  return GetPaginatedNBackSessionsWithResults(page, limit);
};

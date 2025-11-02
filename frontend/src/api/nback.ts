import {
  GetAllNBackResults,
  GetNBackGameSessions,
  GetNBackResultsForSession,
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

export const getNBackGameSessions = (): Promise<types.GameSession[]> => {
  return GetNBackGameSessions();
};

export const getNBackResultsForSession = (
  sessionId: number,
): Promise<types.NBackRecord[]> => {
  return GetNBackResultsForSession(sessionId);
};

export const getAllNBackResults = (): Promise<types.NBackRecord[]> => {
  return GetAllNBackResults();
};

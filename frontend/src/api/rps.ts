import {
  StartRpsGame,
  SubmitRpsAnswer,
  GetRpsGameSessions,
  GetRpsResultsForSession,
  GetAllRpsResults,
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

export const getRpsGameSessions = (): Promise<types.GameSession[]> => {
  return GetRpsGameSessions();
};

export const getRpsResultsForSession = (
  sessionId: number,
): Promise<types.RpsResult[]> => {
  return GetRpsResultsForSession(sessionId);
};

export const getAllRpsResults = (): Promise<types.RpsResult[]> => {
  return GetAllRpsResults();
};

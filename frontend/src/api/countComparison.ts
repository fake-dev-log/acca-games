import {
  StartCountComparisonGame,
  GetNextCountComparisonProblem,
  SubmitCountComparisonAnswer,
  GetPaginatedCountComparisonSessionsWithResults,
  GetCountComparisonSessionStats,
} from '@wails/go/main/App';
import { types } from '@wails/go/models';

export const startCountComparisonGame = (
  settings: types.CountComparisonSettings,
): Promise<number> => {
  return StartCountComparisonGame(settings);
};

export const getNextCountComparisonProblem = (): Promise<
  types.CountComparisonProblem | null
> => {
  return GetNextCountComparisonProblem();
};

export const submitCountComparisonAnswer = (
  submission: types.CountComparisonSubmission,
): Promise<void> => {
  return SubmitCountComparisonAnswer(submission);
};

export const getPaginatedCountComparisonSessionsWithResults = (
  page: number,
  limit: number,
): Promise<types.PaginatedCountComparisonSessions> => {
  return GetPaginatedCountComparisonSessionsWithResults(page, limit);
};

export const getCountComparisonSessionStats = (
  sessionID: number,
): Promise<types.CountComparisonSessionStats> => {
  return GetCountComparisonSessionStats(sessionID);
};

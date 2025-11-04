import { types } from '@wails/go/models';
import { GetNumberPressingGameSessions, GetNumberPressingResultsForSession, GetAllNumberPressingResults } from '@wails/go/main/App';

export const fetchNumberPressingSessions = async (): Promise<types.GameSession[]> => {
  return await GetNumberPressingGameSessions();
};

export const fetchNumberPressingResultsForSession = async (sessionId: number): Promise<{ r1: types.NumberPressingResultR1[], r2: types.NumberPressingResultR2[] }> => {
  const [r1, r2] = await GetNumberPressingResultsForSession(sessionId) as unknown as [types.NumberPressingResultR1[], types.NumberPressingResultR2[]];
  return { r1, r2 };
};

export const fetchAllNumberPressingResults = async (): Promise<{ r1: types.NumberPressingResultR1[], r2: types.NumberPressingResultR2[] }> => {
  const [r1, r2] = await GetAllNumberPressingResults() as unknown as [types.NumberPressingResultR1[], types.NumberPressingResultR2[]];
  return { r1, r2 };
};

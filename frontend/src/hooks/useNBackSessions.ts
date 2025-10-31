import { useState, useEffect } from 'react';
import { types } from '@wails/go/models';
import { GetNBackGameSessions, GetAllNBackResults } from '@wails/go/main/App';

interface UseNBackSessionsResult {
  sessions: types.GameSession[];
  allResults: types.NBackRecord[];
  loading: boolean;
  error: string;
}

export const useNBackSessions = (): UseNBackSessionsResult => {
  const [sessions, setSessions] = useState<types.GameSession[]>([]);
  const [allResults, setAllResults] = useState<types.NBackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      GetNBackGameSessions(),
      GetAllNBackResults()
    ])
      .then(([sessionsData, resultsData]: [types.GameSession[], types.NBackRecord[]]) => {
        setSessions(sessionsData);
        setAllResults(resultsData);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      });
  }, []);

  return { sessions, allResults, loading, error };
};

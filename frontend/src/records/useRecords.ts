import { useEffect, useState } from 'react';
import { GameRecord, RecordPage, recordStore } from './recordStore';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useAsync<T>(load: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err) => !cancelled && setState({ data: null, loading: false, error: err?.message || '기록을 불러오지 못했습니다.' }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const useRecordPage = (gameCode: string, page: number, limit: number) =>
  useAsync<RecordPage>(() => recordStore.list(gameCode, page, limit), [gameCode, page, limit]);

export const useRecord = (id: number) =>
  useAsync<GameRecord | undefined>(() => recordStore.get(id), [id]);

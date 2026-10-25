import { ComponentType } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { GameMode } from '@constants/gameModes';

// 모든 게임 스토어가 공통으로 가져야 하는 상태
export interface GameStoreBase {
  gameMode: GameMode;
  sessionId: number | null;
  resetGame: () => void;
}

export interface MetricOption {
  value: string;
  label: string;
}

export interface BreakdownRow {
  label: string;
  total: number;
  correct: number;
  accuracy: number; // %
  averageTimeMs: number | null; // 시간 지표가 없는 유형은 null
}

export interface Breakdown {
  title: string;
  rows: BreakdownRow[];
}

// 게임 하나의 정의. 라우트·선택 화면·결과 화면·기록 화면이 전부 이 정의만 읽는다.
export interface GameDefinition<S = any, R = any, T extends GameStoreBase = any> {
  code: string;
  slug: string;
  title: string;
  description: string;
  useStore: UseBoundStore<StoreApi<T>>;
  Setup: ComponentType;
  Game: ComponentType;
  ResultDetail: ComponentType<{ results: R[] }>;
  // 결과 화면 진입 시점의 스토어 상태에서 저장할 설정·결과를 꺼낸다
  selectRecord: (state: T) => { settings: S; results: R[] };
  formatSettings: (settings: S) => string[];
  // 기록 추이 차트용 세션 지표. 'accuracy' 는 필수.
  metrics: (results: R[]) => Record<string, number>;
  metricOptions: MetricOption[];
  breakdowns?: (results: R[]) => Breakdown[];
}

export type PotionColor = 'RED' | 'BLUE';
export type RecipePhase = 'before' | 'after';

export interface PotionSettings {
  numTrials: number;
  responseTimeLimitMs: number;
  dominantProbability: number; // 0.6 ~ 0.95 — 조합의 우세 색이 실제로 나올 확률
  recipeChange: boolean; // 중간에 레시피 일부를 뒤집을지
  isRealMode: boolean; // 실전: 100문항 고정 · 연습 전용 표시 없음
}

export interface PotionTrial {
  trialNum: number; // 1부터
  combo: number[]; // 앞면으로 공개된 재료 카드 번호(0~3), 오름차순
  dominant: PotionColor; // 지금 레시피에서 나올 가능성이 높은 색 = 정답
  outcome: PotionColor; // 실제로 만들어진 약
  phase: RecipePhase;
  changedCombo: boolean; // 레시피가 뒤집힌 조합인지(변경 후에만 true)
  scored: boolean; // 처음 본 조합 · 바뀐 뒤 처음 본 조합은 채점하지 않는다
}

export interface PotionGameState {
  settings: PotionSettings;
  trials: PotionTrial[];
  changeAt: number | null; // 이 trialNum 부터 바뀐 레시피
  id: number;
}

export interface PotionResult extends PotionTrial {
  sessionId: number;
  playerChoice: PotionColor | null; // null = 시간 초과
  isCorrect: boolean;
  responseTimeMs: number;
}

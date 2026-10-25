import { accuracyOf } from '@games/stats';
import { PotionResult } from './types';

export interface PotionStats {
  scoredCount: number;
  accuracy: number; // 최적 선택률 — 채점 문제에서 확률 높은 쪽을 고른 비율
  predictionHitRate: number; // 예측 적중률 — 실제로 나온 약과 같게 고른 비율(전체 문제)
  beforeAccuracy: number;
  afterChangedAccuracy: number; // 바뀐 조합에 적응했는지
  afterUnchangedAccuracy: number; // 안 바뀐 조합까지 괜히 바꿔 답하지 않았는지
  hasChange: boolean;
}

export function calculatePotionStats(results: PotionResult[]): PotionStats {
  const scored = results.filter((r) => r.scored);
  const after = scored.filter((r) => r.phase === 'after');
  return {
    scoredCount: scored.length,
    accuracy: accuracyOf(scored),
    predictionHitRate: results.length ? (results.filter((r) => r.playerChoice === r.outcome).length / results.length) * 100 : 0,
    beforeAccuracy: accuracyOf(scored.filter((r) => r.phase === 'before')),
    afterChangedAccuracy: accuracyOf(after.filter((r) => r.changedCombo)),
    afterUnchangedAccuracy: accuracyOf(after.filter((r) => !r.changedCombo)),
    hasChange: results.some((r) => r.phase === 'after'),
  };
}

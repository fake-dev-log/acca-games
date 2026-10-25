import { accuracyOf } from '@games/stats';
import { PotionResult } from './types';

export interface PotionStats {
  scoredCount: number;
  accuracy: number; // 채점 문제 기준
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
    beforeAccuracy: accuracyOf(scored.filter((r) => r.phase === 'before')),
    afterChangedAccuracy: accuracyOf(after.filter((r) => r.changedCombo)),
    afterUnchangedAccuracy: accuracyOf(after.filter((r) => !r.changedCombo)),
    hasChange: results.some((r) => r.phase === 'after'),
  };
}

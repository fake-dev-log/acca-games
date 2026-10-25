import { FC } from 'react';
import { Card } from '@components/common/Card';
import { accuracyOf } from '@games/stats';
import { COMBOS, comboKey } from '../logic/PotionEngine';
import { calculatePotionStats } from '../logic/stats';
import { PotionColor, PotionResult } from '../logic/types';
import { IngredientCards, PotionBadge } from './PotionParts';

const StatCard: FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <Card className="p-4 text-center" bordered>
    <p className="text-sm opacity-70">{label}</p>
    <p className="text-2xl font-bold text-primary">{value}</p>
    {note && <p className="text-xs">{note}</p>}
  </Card>
);

// 조합별 레시피(변경 전 → 후)와 내 정답률
const RecipeTable: FC<{ results: PotionResult[] }> = ({ results }) => {
  const rows = COMBOS.map((combo) => {
    const key = comboKey(combo);
    const mine = results.filter((r) => comboKey(r.combo) === key);
    const before = mine.find((r) => r.phase === 'before')?.dominant;
    const after = mine.find((r) => r.phase === 'after')?.dominant;
    return { key, combo, before, after, changed: mine.some((r) => r.changedCombo), scored: mine.filter((r) => r.scored), count: mine.length };
  }).filter((row) => row.count > 0);

  const color = (c: PotionColor | undefined) => (c ? <PotionBadge color={c} label={c === 'RED' ? '빨강' : '파랑'} /> : <span className="opacity-50">-</span>);

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border-light dark:border-border-dark">
          <th className="py-2 px-2 text-left">조합</th>
          <th className="py-2 px-2 text-center">변경 전</th>
          <th className="py-2 px-2 text-center">변경 후</th>
          <th className="py-2 px-2 text-right">나온 횟수</th>
          <th className="py-2 px-2 text-right">정답률(채점)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className={`border-b border-border-light dark:border-border-dark ${row.changed ? 'bg-accent/20' : ''}`}>
            <td className="py-2 px-2"><IngredientCards combo={row.combo} size="sm" /></td>
            <td className="py-2 px-2 text-center">{color(row.before)}</td>
            <td className="py-2 px-2 text-center">{color(row.after)}{row.changed && <span className="ml-1 text-xs font-bold">바뀜</span>}</td>
            <td className="py-2 px-2 text-right">{row.count}</td>
            <td className="py-2 px-2 text-right">{row.scored.length ? `${accuracyOf(row.scored).toFixed(0)}% (${row.scored.length})` : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const PotionResultDetail: FC<{ results: PotionResult[] }> = ({ results }) => {
  const stats = calculatePotionStats(results);
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="최적 선택률" value={`${stats.accuracy.toFixed(1)}%`} note={`확률 높은 쪽 · 채점 ${stats.scoredCount}/${results.length}`} />
        <StatCard label="예측 적중률" value={`${stats.predictionHitRate.toFixed(1)}%`} note="실제 결과와 같게 고름" />
        <StatCard label="레시피 변경 전" value={`${stats.beforeAccuracy.toFixed(1)}%`} />
        <StatCard label="변경 후 · 바뀐 조합" value={stats.hasChange ? `${stats.afterChangedAccuracy.toFixed(1)}%` : '-'} note="새 레시피에 적응" />
        <StatCard label="변경 후 · 안 바뀐 조합" value={stats.hasChange ? `${stats.afterUnchangedAccuracy.toFixed(1)}%` : '-'} note="괜히 바꿔 답하지 않기" />
      </div>
      <p className="text-sm opacity-70">
        정답(최적 선택)은 실제로 나온 약이 아니라 그 시점 레시피에서 나올 가능성이 높은 약입니다. 예측 적중률은 확률 때문에 최적 선택률보다 낮게 나오는 게 정상입니다. 처음 본 조합과 레시피가 바뀐 뒤 처음 본 조합은 채점하지 않습니다.
      </p>

      <Card title="레시피 (노란 줄 = 중간에 바뀐 조합)" bordered><RecipeTable results={results} /></Card>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="py-2 px-2 text-center">번호</th>
              <th className="py-2 px-2 text-left">조합</th>
              <th className="py-2 px-2 text-center">레시피</th>
              <th className="py-2 px-2 text-center">실제 결과</th>
              <th className="py-2 px-2 text-center">내 답</th>
              <th className="py-2 px-2 text-center">채점</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.trialNum} className={`border-b border-border-light dark:border-border-dark ${r.phase === 'after' ? '' : 'opacity-90'}`}>
                <td className="py-1 px-2 text-center">{r.trialNum}{r.phase === 'after' && <span className="text-xs opacity-60"> 후</span>}</td>
                <td className="py-1 px-2"><IngredientCards combo={r.combo} size="sm" /></td>
                <td className="py-1 px-2 text-center"><PotionBadge color={r.dominant} label={r.dominant === 'RED' ? '빨강' : '파랑'} /></td>
                <td className="py-1 px-2 text-center"><PotionBadge color={r.outcome} label={r.outcome === 'RED' ? '빨강' : '파랑'} /></td>
                <td className="py-1 px-2 text-center">
                  <PotionBadge color={r.playerChoice} label={r.playerChoice === null ? '시간 초과' : r.playerChoice === 'RED' ? '빨강' : '파랑'} />
                </td>
                <td className="py-1 px-2 text-center font-bold">
                  {!r.scored ? <span className="opacity-50 font-normal">제외</span>
                    : r.isCorrect ? <span className="text-success">O</span> : <span className="text-danger">X</span>}
                </td>
                <td className="py-1 px-2 text-right">{(r.responseTimeMs / 1000).toFixed(2)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import { Breakdown } from '@games/types';
import { Card } from '@components/common/Card';

export function BreakdownTable({ breakdown }: { breakdown: Breakdown }) {
  if (breakdown.rows.length === 0) return null;
  const hasTime = breakdown.rows.some((row) => row.averageTimeMs !== null);
  return (
    <Card title={breakdown.title} bordered>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            <th className="py-2 px-2 text-left">구분</th>
            <th className="py-2 px-2 text-right">정답 / 문제</th>
            <th className="py-2 px-2 text-right">정답률</th>
            {hasTime && <th className="py-2 px-2 text-right">평균 시간</th>}
          </tr>
        </thead>
        <tbody>
          {breakdown.rows.map((row) => (
            <tr key={row.label} className="border-b border-border-light dark:border-border-dark">
              <td className="py-2 px-2">{row.label}</td>
              <td className="py-2 px-2 text-right">{row.correct} / {row.total}</td>
              <td className="py-2 px-2 text-right font-bold">{row.accuracy.toFixed(1)}%</td>
              {hasTime && <td className="py-2 px-2 text-right">{row.averageTimeMs === null ? '-' : `${(row.averageTimeMs / 1000).toFixed(2)}s`}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

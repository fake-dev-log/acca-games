import { FC, Fragment, useState } from 'react';
import { Card } from '@components/common/Card';
import { calculatePathStats, isOptimal } from '../logic/stats';
import { PathResult } from '../logic/types';
import { PathBoard } from './PathBoard';

const StatCard: FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <Card className="p-4 text-center" bordered>
    <p className="text-sm opacity-70">{label}</p>
    <p className="text-2xl font-bold text-primary">{value}</p>
    {note && <p className="text-xs">{note}</p>}
  </Card>
);

const status = (r: PathResult) => {
  if (r.revealed) return <span className="opacity-60">정답 봄</span>;
  if (!r.isCorrect) return <span className="text-danger">미해결</span>;
  return isOptimal(r) ? <span className="text-success font-bold">최소</span> : <span className="text-warning font-bold">해결</span>;
};

export const PathResultDetail: FC<{ results: PathResult[] }> = ({ results }) => {
  const stats = calculatePathStats(results);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="해결" value={`${stats.solvedCount}문제`} note={`시도 ${results.length}문제 · ${stats.accuracy.toFixed(0)}%`} />
        <StatCard label="최소 울타리로 해결" value={`${stats.optimalRate.toFixed(0)}%`} note="해결한 문제 중" />
        <StatCard label="평균 초과 클릭" value={`${stats.averageExtraClicks.toFixed(1)}번`} note="해결한 문제, 최소 클릭 대비" />
        <StatCard label="평균 해결 시간" value={`${(stats.averageSolveTimeMs / 1000).toFixed(1)}s`} />
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            <th className="py-2 px-2 text-center">번호</th>
            <th className="py-2 px-2 text-center">라운드</th>
            <th className="py-2 px-2 text-center">결과</th>
            <th className="py-2 px-2 text-right">울타리 (사용/최소)</th>
            <th className="py-2 px-2 text-right">클릭 (사용/최소)</th>
            <th className="py-2 px-2 text-right">출발</th>
            <th className="py-2 px-2 text-right">시간</th>
            <th className="py-2 px-2" />
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <Fragment key={r.problemNum}>
              <tr className="border-b border-border-light dark:border-border-dark">
                <td className="py-2 px-2 text-center">{r.problemNum}</td>
                <td className="py-2 px-2 text-center">{r.round} ({r.puzzle.size}×{r.puzzle.size})</td>
                <td className="py-2 px-2 text-center">{status(r)}</td>
                <td className="py-2 px-2 text-right">{r.fencesUsed} / {r.puzzle.minFences}</td>
                <td className="py-2 px-2 text-right">{r.clicks} / {r.puzzle.minClicks}</td>
                <td className="py-2 px-2 text-right">{r.attempts}</td>
                <td className="py-2 px-2 text-right">{(r.timeMs / 1000).toFixed(1)}s</td>
                <td className="py-2 px-2 text-right">
                  <button type="button" className="underline text-xs" onClick={() => setOpen(open === r.problemNum ? null : r.problemNum)}>
                    {open === r.problemNum ? '닫기' : '판 보기'}
                  </button>
                </td>
              </tr>
              {open === r.problemNum && (
                <tr>
                  <td colSpan={8} className="py-3">
                    <div className="flex gap-8 justify-center">
                      <div className="text-center"><p className="text-xs mb-1">내 배치</p><PathBoard compact size={r.puzzle.size} board={r.board} vehicles={r.puzzle.vehicles} /></div>
                      <div className="text-center"><p className="text-xs mb-1">최소 배치 예시</p><PathBoard compact size={r.puzzle.size} board={r.puzzle.solution} vehicles={r.puzzle.vehicles} /></div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

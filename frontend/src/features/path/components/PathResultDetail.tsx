import { FC, Fragment, useState } from 'react';
import { Card } from '@components/common/Card';
import { calculatePathStats } from '../logic/stats';
import { pathEngine } from '../logic/PathEngine';
import { PathResult } from '../logic/types';
import { PathBoard } from './PathBoard';

const StatCard: FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <Card className="p-4 text-center" bordered>
    <p className="text-sm opacity-70">{label}</p>
    <p className="text-2xl font-bold text-primary">{value}</p>
    {note && <p className="text-xs">{note}</p>}
  </Card>
);

const VERDICT = {
  perfect: <span className="text-success font-bold">완벽</span>,
  excess: <span className="text-warning font-bold">초과 설치</span>,
  wrong: <span className="text-danger">오답</span>,
};

export const PathResultDetail: FC<{ results: PathResult[] }> = ({ results }) => {
  const stats = calculatePathStats(results);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="해결" value={`${stats.solvedCount}문제`} note={`시도 ${results.length}문제 · ${stats.accuracy.toFixed(0)}%`} />
        <StatCard label="완벽" value={`${stats.perfectCount}문제`} note="최소 울타리로 해결" />
        <StatCard label="평균 초과 설치" value={`${stats.averageExcess.toFixed(2)}개`} note="해결한 문제 기준" />
        <StatCard label="평균 해결 시간" value={`${(stats.averageSolveTimeMs / 1000).toFixed(1)}s`} />
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border-light dark:border-border-dark">
            <th className="py-2 px-2 text-center">번호</th>
            <th className="py-2 px-2 text-center">결과</th>
            <th className="py-2 px-2 text-right">울타리 (설치/정답)</th>
            <th className="py-2 px-2 text-right">교통수단</th>
            <th className="py-2 px-2 text-right">클릭</th>
            <th className="py-2 px-2 text-right">시간</th>
            <th className="py-2 px-2" />
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <Fragment key={r.problemNum}>
              <tr className="border-b border-border-light dark:border-border-dark">
                <td className="py-2 px-2 text-center">{r.problemNum}</td>
                <td className="py-2 px-2 text-center">{VERDICT[r.verdict]}</td>
                <td className="py-2 px-2 text-right">{r.fencesUsed} / {r.puzzle.minFences}</td>
                <td className="py-2 px-2 text-right">{r.puzzle.vehicles.length}대{r.puzzle.walls.flat().some(Boolean) ? ' · 벽' : ''}</td>
                <td className="py-2 px-2 text-right">{r.clicks}</td>
                <td className="py-2 px-2 text-right">{(r.timeMs / 1000).toFixed(1)}s</td>
                <td className="py-2 px-2 text-right">
                  <button type="button" className="underline text-xs" onClick={() => setOpen(open === r.problemNum ? null : r.problemNum)}>
                    {open === r.problemNum ? '닫기' : '판 보기'}
                  </button>
                </td>
              </tr>
              {open === r.problemNum && (
                <tr>
                  <td colSpan={7} className="py-3">
                    <div className="flex gap-8 justify-center">
                      <div className="text-center">
                        <p className="text-xs mb-1">내 울타리로 차가 간 길</p>
                        <PathBoard compact size={r.puzzle.size} board={r.board} walls={r.puzzle.walls} vehicles={r.puzzle.vehicles}
                          traces={pathEngine.check(r.puzzle, r.board).traces} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs mb-1">정답 예시</p>
                        <PathBoard compact size={r.puzzle.size} board={r.puzzle.solution} walls={r.puzzle.walls} vehicles={r.puzzle.vehicles}
                          traces={pathEngine.check(r.puzzle, r.puzzle.solution).traces} />
                      </div>
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

import { FC } from 'react';
import { ShapeRotationResult } from '../logic/types';
import { calculateShapeRotationStats } from '../logic/stats';
import { Card } from '@components/common/Card';
import { SolutionTray } from '@components/game_setup/SolutionTray';

interface ShapeRotationResultDetailProps {
  results: ShapeRotationResult[];
}

export const ShapeRotationResultDetail: FC<ShapeRotationResultDetailProps> = ({ results }) => {
  const stats = calculateShapeRotationStats(results);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">전체 정답률</p>
          <p className="text-2xl font-bold text-primary">{stats.accuracy.toFixed(1)}%</p>
          <p className="text-xs">{stats.totalCorrect} / {stats.totalQuestions}</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">평균 해결 시간</p>
          <p className="text-2xl font-bold text-primary">{(stats.averageSolveTimeMs / 1000).toFixed(2)}s</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">평균 클릭 횟수</p>
          <p className="text-2xl font-bold text-primary">{stats.averageClickCount.toFixed(1)}회</p>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-divider-light dark:border-divider-dark">
              <th className="py-2 px-2 text-center">번호</th>
              <th className="py-2 px-2 text-left">나의 풀이</th>
              <th className="py-2 px-2 text-center">결과</th>
              <th className="py-2 px-2 text-center">클릭</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                <td className="py-2 px-2 text-center">{i + 1}</td>
                <td className="py-2 px-2">
                  <div className="scale-75 origin-left">
                    <SolutionTray solution={r.userSolution} maxSlots={r.userSolution.length > 8 ? r.userSolution.length : 8} />
                  </div>
                </td>
                <td className="py-2 px-2 text-center font-bold">
                  {r.isCorrect ? <span className="text-success">O</span> : <span className="text-danger">X</span>}
                </td>
                <td className="py-2 px-2 text-center">{r.clickCount}</td>
                <td className="py-2 px-2 text-right">{(r.solveTime / 1000).toFixed(2)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import { FC } from 'react';
import { CountComparisonResult } from '../logic/types';
import { calculateCountComparisonStats } from '../logic/stats';
import { Card } from '@components/common/Card';

interface CountComparisonResultDetailProps {
  results: CountComparisonResult[];
}

export const CountComparisonResultDetail: FC<CountComparisonResultDetailProps> = ({ results }) => {
  const stats = calculateCountComparisonStats(results);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">전체 정답률</p>
          <p className="text-2xl font-bold text-primary">{stats.accuracy.toFixed(1)}%</p>
          <p className="text-xs">{stats.totalCorrect} / {stats.totalQuestions}</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">평균 반응 속도</p>
          <p className="text-2xl font-bold text-primary">{(stats.averageResponseTimeMs / 1000).toFixed(2)}s</p>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-divider-light dark:border-divider-dark">
              <th className="py-2 px-2 text-center">No.</th>
              <th className="py-2 px-2 text-center">왼쪽 (개수)</th>
              <th className="py-2 px-2 text-center">오른쪽 (개수)</th>
              <th className="py-2 px-2 text-center">정답</th>
              <th className="py-2 px-2 text-center">내 선택</th>
              <th className="py-2 px-2 text-center">결과</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                <td className="py-2 px-2 text-center">{r.problemNumber}</td>
                <td className="py-2 px-2 text-center">{r.leftWord} ({r.leftWordCount})</td>
                <td className="py-2 px-2 text-center">{r.rightWord} ({r.rightWordCount})</td>
                <td className="py-2 px-2 text-center font-bold">
                  {r.correctChoice === 'left' ? r.leftWord : r.rightWord}
                </td>
                <td className="py-2 px-2 text-center">
                  {r.playerChoice === 'MISS' ? '❌' : (r.playerChoice === 'left' ? r.leftWord : r.rightWord)}
                </td>
                <td className="py-2 px-2 text-center font-bold">
                  {r.isCorrect ? <span className="text-success">O</span> : <span className="text-danger">X</span>}
                </td>
                <td className="py-2 px-2 text-right">{(r.responseTimeMs / 1000).toFixed(2)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

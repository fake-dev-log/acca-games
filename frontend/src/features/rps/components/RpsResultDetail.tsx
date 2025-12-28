import { FC } from 'react';
import { RpsResult } from '../logic/types';
import { calculateRpsStats } from '../logic/stats';
import { Card } from '@components/common/Card';

interface RpsResultDetailProps {
  results: RpsResult[];
}

export const RpsResultDetail: FC<RpsResultDetailProps> = ({ results }) => {
  const stats = calculateRpsStats(results);

  const cardIcon = (card: string) => {
    if (card === 'ROCK') return '✊';
    if (card === 'PAPER') return '✋';
    if (card === 'SCISSORS') return '✌️';
    return card;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">전체 정답률</p>
          <p className="text-2xl font-bold text-primary">{stats.accuracy.toFixed(1)}%</p>
          <p className="text-xs">{stats.totalCorrect} / {stats.totalQuestions}</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">평균 반응 속도</p>
          <p className="text-2xl font-bold text-primary">{(stats.averageResponseTimeMs / 1000).toFixed(2)}s</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">총 소요 시간</p>
          <p className="text-2xl font-bold text-primary">
            {(results.reduce((acc, r) => acc + r.responseTimeMs, 0) / 1000).toFixed(1)}s
          </p>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-divider-light dark:border-divider-dark">
              <th className="py-2 px-2 text-center">R</th>
              <th className="py-2 px-2 text-center">제시</th>
              <th className="py-2 px-2 text-left">주체</th>
              <th className="py-2 px-2 text-center">내 선택</th>
              <th className="py-2 px-2 text-center">정답</th>
              <th className="py-2 px-2 text-center">결과</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                <td className="py-2 px-2 text-center">{r.round}</td>
                <td className="py-2 px-2 text-center text-xl">{cardIcon(r.givenCard)}</td>
                <td className="py-2 px-2 text-left">{r.problemCardHolder === 'me' ? '나' : '상대'}</td>
                <td className="py-2 px-2 text-center text-xl">{r.playerChoice === 'MISS' ? '❌' : cardIcon(r.playerChoice)}</td>
                <td className="py-2 px-2 text-center text-xl">{cardIcon(r.correctChoice)}</td>
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

import { FC } from 'react';
import { NumberPressingResult, NumberPressingResultR1, NumberPressingResultR2 } from '../logic/types';
import { calculateNumberPressingStats } from '../logic/stats';
import { Card } from '@components/common/Card';

interface NumberPressingResultDetailProps {
  results: NumberPressingResult[];
}

function isResultR1(result: NumberPressingResult): result is NumberPressingResultR1 {
  return 'targetNumber' in result.problem;
}

export const NumberPressingResultDetail: FC<NumberPressingResultDetailProps> = ({ results }) => {
  const stats = calculateNumberPressingStats(results);
  const resultsR1 = results.filter(isResultR1);
  const resultsR2 = results.filter(r => !isResultR1(r)) as NumberPressingResultR2[];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">전체 정답률</p>
          <p className="text-2xl font-bold text-primary">{stats.accuracy.toFixed(1)}%</p>
          <p className="text-xs">{stats.totalCorrect} / {stats.totalQuestions}</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">평균 소요 시간</p>
          <p className="text-2xl font-bold text-primary">{stats.averageTimeTaken.toFixed(2)}s</p>
        </Card>
      </div>

      {stats.roundStats.map((roundStat) => (
        <div key={roundStat.round} className="space-y-2">
          <h3 className="text-lg font-bold">라운드 {roundStat.round}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-divider-light dark:border-divider-dark">
                  <th className="py-2 px-2 text-center">No.</th>
                  <th className="py-2 px-2 text-left">문제</th>
                  <th className="py-2 px-2 text-center">결과</th>
                  <th className="py-2 px-2 text-right">시간</th>
                </tr>
              </thead>
              <tbody>
                {roundStat.round === 1 && resultsR1.map((r, i) => (
                  <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                    <td className="py-2 px-2 text-center">{i + 1}</td>
                    <td className="py-2 px-2 text-left">숫자 {r.problem.targetNumber}</td>
                    <td className="py-2 px-2 text-center font-bold">
                      {r.isCorrect ? <span className="text-success">O</span> : <span className="text-danger">X</span>}
                    </td>
                    <td className="py-2 px-2 text-right">{r.timeTaken.toFixed(2)}s</td>
                  </tr>
                ))}
                {roundStat.round === 2 && resultsR2.map((r, i) => (
                  <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                    <td className="py-2 px-2 text-center">{i + 1}</td>
                    <td className="py-2 px-2 text-left">
                      <div className="text-xs">
                        {r.problem.doubleClick.length > 0 && <span>더블: {r.problem.doubleClick.join(', ')} </span>}
                        {r.problem.skip.length > 0 && <span>건너뜀: {r.problem.skip.join(', ')}</span>}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center font-bold">
                      {r.isCorrect ? <span className="text-success">O</span> : <span className="text-danger">X</span>}
                    </td>
                    <td className="py-2 px-2 text-right">{r.timeTaken.toFixed(2)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
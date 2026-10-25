import { FC } from 'react';
import { Card } from '@components/common/Card';
import { accuracyOf, averageOf } from '@games/stats';
import { ROUND_INFO } from '../logic/AppointmentEngine';
import { AppointmentResult } from '../logic/types';
import { formatItem } from './AppointmentItems';

export const AppointmentResultDetail: FC<{ results: AppointmentResult[] }> = ({ results }) => {
  const correct = results.filter((r) => r.isCorrect).length;
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">전체 정답률</p>
          <p className="text-2xl font-bold text-primary">{accuracyOf(results).toFixed(1)}%</p>
          <p className="text-xs">{correct} / {results.length}</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">평균 응답 시간</p>
          <p className="text-2xl font-bold text-primary">{(averageOf(results, (r) => r.responseTimeMs) / 1000).toFixed(2)}s</p>
        </Card>
        <Card className="p-4 text-center" bordered>
          <p className="text-sm opacity-70">시간 초과</p>
          <p className="text-2xl font-bold text-primary">{results.filter((r) => r.playerChoice === null).length}회</p>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th className="py-2 px-2 text-center">번호</th>
              <th className="py-2 px-2 text-center">라운드</th>
              <th className="py-2 px-2 text-left">세 사람이 보여 준 것</th>
              <th className="py-2 px-2 text-center">정답</th>
              <th className="py-2 px-2 text-center">내 답</th>
              <th className="py-2 px-2 text-center">결과</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.questionNum} className="border-b border-border-light dark:border-border-dark align-top">
                <td className="py-2 px-2 text-center">{r.questionNum}</td>
                <td className="py-2 px-2 text-center">{ROUND_INFO[r.round].name}</td>
                <td className="py-2 px-2">
                  {r.people.map((items, i) => (
                    <p key={i}>{i + 1}: {items.map((item) => formatItem(r.round, item)).join(', ')}</p>
                  ))}
                </td>
                <td className="py-2 px-2 text-center">{formatItem(r.round, r.answer)}</td>
                <td className="py-2 px-2 text-center">{r.playerChoice === null ? '시간 초과' : formatItem(r.round, r.playerChoice)}</td>
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

import { FC } from 'react';
import { ShapeRotationResult } from '../logic/types';
import { calculateShapeRotationStats } from '../logic/stats';
import { Card } from '@components/common/Card';
import { SolutionTray } from '@components/game_setup/SolutionTray';
import ShapeDisplay from '@components/shapes/shape_rotation/ShapeDisplay';

interface ShapeRotationResultDetailProps {
  results: ShapeRotationResult[];
}

const roundLabel = (round: number) => (round === 2 ? '격자' : '알파벳');

const WrongProblem: FC<{ result: ShapeRotationResult; index: number }> = ({ result, index }) => {
  const { problem } = result;
  return (
    <Card bordered className="p-4">
      <p className="font-bold mb-3">
        {index + 1}번 · {roundLabel(problem.Round)} · 최소 {problem.MinMoves}번
      </p>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm opacity-70">전</span>
            <ShapeDisplay shapeString={problem.InitialShape} gridPath={problem.InitialGridPath}
              centerX={problem.InitialShapeCenterX} centerY={problem.InitialShapeCenterY} />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm opacity-70">후</span>
            <ShapeDisplay shapeString={problem.FinalShape} gridPath={problem.FinalGridPath}
              centerX={problem.FinalShapeCenterX} centerY={problem.FinalShapeCenterY} />
          </div>
        </div>
        <div className="flex-grow space-y-3 w-full">
          <div>
            <p className="text-sm opacity-70 mb-1">
              나의 풀이 ({result.userSolution.length}번{result.userSolution.length === 0 ? ' · 미제출' : ''})
            </p>
            <SolutionTray solution={result.userSolution} maxSlots={Math.max(8, result.userSolution.length)} />
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1">최소 풀이 예시 ({problem.Solution.length}번)</p>
            <SolutionTray solution={problem.Solution} maxSlots={8} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ShapeRotationResultDetail: FC<ShapeRotationResultDetailProps> = ({ results }) => {
  const stats = calculateShapeRotationStats(results);
  const wrong = results.map((result, index) => ({ result, index })).filter(({ result }) => !result.isCorrect);

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
              <th className="py-2 px-2 text-center">라운드</th>
              <th className="py-2 px-2 text-left">나의 풀이</th>
              <th className="py-2 px-2 text-center">최소</th>
              <th className="py-2 px-2 text-center">결과</th>
              <th className="py-2 px-2 text-center">클릭</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                <td className="py-2 px-2 text-center">{i + 1}</td>
                <td className="py-2 px-2 text-center">{roundLabel(r.problem.Round)}</td>
                <td className="py-2 px-2">
                  <div className="scale-75 origin-left">
                    <SolutionTray solution={r.userSolution} maxSlots={r.userSolution.length > 8 ? r.userSolution.length : 8} />
                  </div>
                </td>
                <td className="py-2 px-2 text-center">{r.problem.MinMoves}</td>
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

      <section className="space-y-4">
        <h3 className="text-xl font-bold">오답 문제 다시 보기 ({wrong.length})</h3>
        {wrong.length === 0
          ? <p className="opacity-70">틀린 문제가 없습니다.</p>
          : wrong.map(({ result, index }) => <WrongProblem key={index} result={result} index={index} />)}
      </section>
    </div>
  );
};

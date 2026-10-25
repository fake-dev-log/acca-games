import { FC } from 'react';
import { NBackResult } from '../logic/types';
import { calculateNBackStats } from '../logic/stats';
import { Card } from '@components/common/Card';
import { Circle } from '@components/shapes/nback/Circle';
import { Square } from '@components/shapes/nback/Square';
import { Triangle } from '@components/shapes/nback/Triangle';
import { Trapezoid } from '@components/shapes/nback/Trapezoid';
import { Hourglass } from '@components/shapes/nback/Hourglass';
import { Diamond } from '@components/shapes/nback/Diamond';
import { Rhombus } from '@components/shapes/nback/Rhombus';
import { Butterfly } from '@components/shapes/nback/Butterfly';
import { Star } from '@components/shapes/nback/Star';
import { Check } from '@components/shapes/nback/Check';
import { Horns } from '@components/shapes/nback/Horns';
import { Pyramid } from '@components/shapes/nback/Pyramid';
import { DoubleTriangle } from '@components/shapes/nback/DoubleTriangle';
import { XShape } from '@components/shapes/nback/XShape';
import { Crown } from '@components/shapes/nback/Crown';

const shapeMap: { [key: string]: FC } = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  trapezoid: Trapezoid,
  hourglass: Hourglass,
  diamond: Diamond,
  rhombus: Rhombus,
  butterfly: Butterfly,
  star: Star,
  check: Check,
  horns: Horns,
  pyramid: Pyramid,
  double_triangle: DoubleTriangle,
  x_shape: XShape,
  crown: Crown,
};

interface NBackResultDetailProps {
  results: NBackResult[];
}

export const NBackResultDetail: FC<NBackResultDetailProps> = ({ results }) => {
  const stats = calculateNBackStats(results);

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
              <th className="py-2 px-2 text-center">제시 도형</th>
              <th className="py-2 px-2 text-center">정답</th>
              <th className="py-2 px-2 text-center">내 선택</th>
              <th className="py-2 px-2 text-center">결과</th>
              <th className="py-2 px-2 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const ShapeComponent = shapeMap[r.presentedShape];
              return (
                <tr key={i} className="border-b border-divider-light dark:border-divider-dark opacity-90 hover:opacity-100">
                  <td className="py-2 px-2 text-center">{r.questionNum + 1}</td>
                  <td className="py-2 px-2 flex justify-center">
                    <div className="w-8 h-8">
                      {ShapeComponent && <ShapeComponent />}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">{r.correctChoice === 'MISS' ? '-' : r.correctChoice}</td>
                  <td className="py-2 px-2 text-center">{r.playerChoice === 'MISS' ? '❌' : r.playerChoice}</td>
                  <td className="py-2 px-2 text-center font-bold">
                    {r.isCorrect ? <span className="text-success">O</span> : <span className="text-danger">X</span>}
                  </td>
                  <td className="py-2 px-2 text-right">{(r.responseTimeMs / 1000).toFixed(2)}s</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

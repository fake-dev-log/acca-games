// This is a simplified map for the button, the full map is in NBackGame.tsx
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

const shapeMap: { [key: string]: React.ComponentType } = {
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

interface Props {
  groupName: string;
  shapes: string[];
  isSelected: boolean;
  onClick: () => void;
}

export const ShapeSetButton = ({ groupName, shapes, isSelected, onClick }: Props) => {
  const baseClasses = 'p-3 rounded-lg border-2 transition-all';
  const selectedClasses = 'border-indigo-600 bg-indigo-100 shadow-lg';
  const unselectedClasses = 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50';

  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
      <div className="flex justify-center items-center space-x-2 mb-2">
        {shapes.map(shapeName => {
          const ShapeComponent = shapeMap[shapeName];
          return (
            <div key={shapeName} className="w-8 h-8">
              {ShapeComponent && <ShapeComponent />}
            </div>
          );
        })}
      </div>
      <p className="text-sm font-medium text-gray-700">{groupName}</p>
    </button>
  );
};

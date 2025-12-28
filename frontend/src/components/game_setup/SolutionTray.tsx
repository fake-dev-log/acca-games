import { FC } from 'react';
import { Transform } from '@features/shape-rotation/logic/types';
import { FaArrowRotateLeft, FaArrowRotateRight } from "react-icons/fa6";
import { RiFlipHorizontalFill, RiFlipVerticalFill } from "react-icons/ri";

interface SolutionTrayProps {
  solution: Transform[];
  maxSlots?: number;
}

const transformIconMap: Record<Transform, FC> = {
  'rotate_left_45': FaArrowRotateLeft,
  'rotate_right_45': FaArrowRotateRight,
  'flip_horizontal': RiFlipHorizontalFill,
  'flip_vertical': RiFlipVerticalFill,
};

export const SolutionTray: FC<SolutionTrayProps> = ({ solution, maxSlots = 8 }) => {
  const slots = Array.from({ length: maxSlots });

  return (
    <div className="w-full p-2 border bg-gray-50 dark:bg-gray-800 rounded-md">
      <div className={`grid grid-cols-10 grid-rows-2 gap-2`}>
        {slots.map((_, index) => {
          const transform = solution[index];
          const Icon = transform ? transformIconMap[transform] : null;
          return (
            <div key={index} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              {Icon && <Icon />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

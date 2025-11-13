import { FC } from "react";

interface ShapeDisplayProps {
  shapeString: string;
  gridPath?: string;
  centerX?: number;
  centerY?: number;
}

const ShapeDisplay: FC<ShapeDisplayProps> = ({ shapeString, gridPath, centerX = 0, centerY = 0 }) => {
  const transform = `translate(${-centerX}, ${-centerY})`;
  const viewBox = gridPath ? "-150 -150 300 300" : "-50 -50 100 100";

  return (
    <div className="w-40 h-40 border p-2 bg-white flex items-center justify-center">
      <svg viewBox={viewBox} className="w-full h-full">
        <g transform={transform}>
          {gridPath && (
            <path
              d={gridPath}
              stroke="#A9A9A9" // DarkGray
              strokeWidth="1"
              fill="none"
            />
          )}
          <path
            d={shapeString}
            stroke="black"
            strokeWidth="1"
            fill="black"
          />
        </g>
      </svg>
    </div>
  );
};

export default ShapeDisplay;


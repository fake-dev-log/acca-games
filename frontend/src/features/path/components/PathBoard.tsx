import { FC } from 'react';
import { Cell, Port, Vehicle } from '../logic/types';
import { Trace } from '../logic/board';

const UNIT = 60;

interface PathBoardProps {
  size: number;
  board: Cell[][];
  vehicles: Vehicle[];
  traces?: (Trace & { arrived: boolean })[] | null;
  onCellClick?: (r: number, c: number) => void;
  compact?: boolean;
}

// 바깥 한 줄을 포함한 (size+2)×(size+2) 좌표에서 자리의 가운데
const portCenter = (port: Port, size: number): [number, number] => {
  switch (port.side) {
    case 'top': return [port.index + 1.5, 0.5];
    case 'bottom': return [port.index + 1.5, size + 1.5];
    case 'left': return [0.5, port.index + 1.5];
    case 'right': return [size + 1.5, port.index + 1.5];
  }
};

const ARROW: Record<Port['side'], string> = { top: '↓', bottom: '↑', left: '→', right: '←' };

export const PathBoard: FC<PathBoardProps> = ({ size, board, vehicles, traces, onCellClick, compact = false }) => {
  const span = (size + 2) * UNIT;
  return (
    <svg viewBox={`0 0 ${span} ${span}`} className={compact ? 'w-40 h-40' : 'w-full max-w-[480px] aspect-square'}>
      {board.map((row, r) => row.map((cell, c) => {
        const x = (c + 1) * UNIT;
        const y = (r + 1) * UNIT;
        return (
          <g key={`${r}-${c}`} role={onCellClick ? 'button' : undefined} aria-label={`${r + 1}행 ${c + 1}열`}
            onClick={onCellClick ? () => onCellClick(r, c) : undefined} className={onCellClick ? 'cursor-pointer' : undefined}>
            <rect x={x} y={y} width={UNIT} height={UNIT} className="fill-[#F5F2E9] dark:fill-[#404A3F] stroke-[#A1A1A1]" strokeWidth={1} />
            {cell && (
              <line x1={x + 6} x2={x + UNIT - 6} y1={cell === '/' ? y + UNIT - 6 : y + 6} y2={cell === '/' ? y + 6 : y + UNIT - 6}
                stroke="#8B5A2B" strokeWidth={7} strokeLinecap="round" />
            )}
          </g>
        );
      }))}

      {traces?.map((t, i) => {
        const points = [portCenter(vehicles[i].entry, size), ...t.cells.map(([r, c]) => [c + 1.5, r + 1.5]), portCenter(t.exit, size)]
          .map(([x, y]) => `${x * UNIT},${y * UNIT}`).join(' ');
        return (
          <polyline key={i} points={points} fill="none" stroke={vehicles[i].color} strokeWidth={5} strokeOpacity={0.75}
            strokeDasharray={t.arrived ? undefined : '10 8'} strokeLinejoin="round" pointerEvents="none" />
        );
      })}

      {vehicles.map((v) => {
        const [ex, ey] = portCenter(v.entry, size);
        const [tx, ty] = portCenter(v.target, size);
        return (
          <g key={v.color} pointerEvents="none">
            <circle cx={ex * UNIT} cy={ey * UNIT} r={UNIT * 0.42} fill={v.color} />
            <text x={ex * UNIT} y={ey * UNIT + 2} textAnchor="middle" dominantBaseline="middle" fontSize={22}>🚗</text>
            <text x={ex * UNIT} y={ey * UNIT + UNIT * 0.36} textAnchor="middle" fontSize={14} fill="white" fontWeight="bold">{ARROW[v.entry.side]}</text>
            <circle cx={tx * UNIT} cy={ty * UNIT} r={UNIT * 0.42} fill="white" stroke={v.color} strokeWidth={6} />
            <text x={tx * UNIT} y={ty * UNIT + 2} textAnchor="middle" dominantBaseline="middle" fontSize={24}>🙋</text>
          </g>
        );
      })}
    </svg>
  );
};

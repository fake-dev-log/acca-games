import { FC, MouseEvent, useState } from 'react';
import { Cell, Fence, Port, Vehicle } from '../logic/types';
import { fenceAt, Trace } from '../logic/board';
import { VEHICLE_INFO } from '../logic/generator';

const UNIT = 60;

export type BoardInput =
  | { mode: 'pointer'; onPlace: (r: number, c: number, fence: Fence) => void } // 누른 위치로 방향 결정
  | { mode: 'choose'; selected: [number, number] | null; onSelect: (r: number, c: number) => void }; // 칸 고르고 방향 버튼

interface PathBoardProps {
  size: number;
  board: Cell[][];
  walls: boolean[][];
  vehicles: Vehicle[];
  traces?: (Trace & { arrived: boolean })[] | null;
  input?: BoardInput;
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

const fenceLine = (x: number, y: number, fence: Fence, inset = 6) => ({
  x1: x + inset, x2: x + UNIT - inset,
  y1: fence === '/' ? y + UNIT - inset : y + inset,
  y2: fence === '/' ? y + inset : y + UNIT - inset,
});

const localPoint = (e: MouseEvent<SVGRectElement>): [number, number] => {
  const rect = e.currentTarget.getBoundingClientRect();
  return [(e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height];
};

export const PathBoard: FC<PathBoardProps> = ({ size, board, walls, vehicles, traces, input, compact = false }) => {
  const [hover, setHover] = useState<{ r: number; c: number; fence: Fence } | null>(null);
  const span = (size + 2) * UNIT;

  return (
    <svg viewBox={`0 0 ${span} ${span}`} className={compact ? 'w-44 h-44' : 'w-full max-w-[440px] aspect-square select-none'}
      onMouseLeave={() => setHover(null)}>
      {board.map((row, r) => row.map((cell, c) => {
        const x = (c + 1) * UNIT;
        const y = (r + 1) * UNIT;
        const wall = walls[r][c];
        const selected = input?.mode === 'choose' && input.selected?.[0] === r && input.selected?.[1] === c;
        const preview = input?.mode === 'pointer' && !cell && !wall && hover?.r === r && hover?.c === c ? hover.fence : null;
        return (
          <g key={`${r}-${c}`}>
            <rect x={x} y={y} width={UNIT} height={UNIT} strokeWidth={selected ? 4 : 1}
              className={`${wall ? 'fill-[#7a7a7a]' : 'fill-white dark:fill-[#e9e5da]'} ${selected ? 'stroke-primary' : 'stroke-[#b5b5b5]'} ${input && !wall ? 'cursor-pointer' : ''}`}
              role={input && !wall ? 'button' : undefined} aria-label={wall ? `${r + 1}행 ${c + 1}열 벽` : `${r + 1}행 ${c + 1}열`}
              onMouseMove={input?.mode === 'pointer' && !wall ? (e) => setHover({ r, c, fence: fenceAt(...localPoint(e)) }) : undefined}
              onClick={input && !wall ? (e) => {
                if (input.mode === 'pointer') input.onPlace(r, c, fenceAt(...localPoint(e)));
                else input.onSelect(r, c);
              } : undefined} />
            {!wall && !cell && !compact && (
              <g pointerEvents="none" stroke="#e2e2e2" strokeWidth={2}>
                <line {...fenceLine(x, y, '/', 10)} />
                <line {...fenceLine(x, y, '\\', 10)} />
              </g>
            )}
            {preview && <line {...fenceLine(x, y, preview)} stroke="#9a9a9a" strokeWidth={7} strokeLinecap="round" pointerEvents="none" />}
            {cell && <line {...fenceLine(x, y, cell)} stroke="#6b4423" strokeWidth={8} strokeLinecap="round" pointerEvents="none" />}
          </g>
        );
      }))}

      {traces?.map((t, i) => {
        const end = t.exit ? [portCenter(t.exit, size)] : [];
        const points = [portCenter(vehicles[i].entry, size), ...t.cells.map(([r, c]) => [c + 1.5, r + 1.5]), ...end]
          .map(([x, y]) => `${x * UNIT},${y * UNIT}`).join(' ');
        return (
          <polyline key={i} points={points} fill="none" stroke={VEHICLE_INFO[vehicles[i].kind].color} strokeWidth={5} strokeOpacity={0.8}
            strokeDasharray={t.arrived ? undefined : '10 8'} strokeLinejoin="round" pointerEvents="none" />
        );
      })}

      {vehicles.map((v) => {
        const info = VEHICLE_INFO[v.kind];
        const [ex, ey] = portCenter(v.entry, size);
        const [tx, ty] = portCenter(v.target, size);
        return (
          <g key={v.kind} pointerEvents="none">
            <circle cx={ex * UNIT} cy={ey * UNIT} r={UNIT * 0.42} fill="white" stroke={info.color} strokeWidth={5} />
            <text x={ex * UNIT} y={ey * UNIT + 2} textAnchor="middle" dominantBaseline="middle" fontSize={26}>{info.vehicle}</text>
            <circle cx={tx * UNIT} cy={ty * UNIT} r={UNIT * 0.42} fill="white" stroke={info.color} strokeWidth={5} strokeDasharray="6 4" />
            <text x={tx * UNIT} y={ty * UNIT + 2} textAnchor="middle" dominantBaseline="middle" fontSize={26}>{info.customer}</text>
          </g>
        );
      })}
    </svg>
  );
};

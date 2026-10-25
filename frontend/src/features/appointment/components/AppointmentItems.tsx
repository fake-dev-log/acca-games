import { FC } from 'react';
import { DAYS, MAP_CELLS } from '../logic/AppointmentEngine';

const MENU_EMOJI: Record<string, string> = {
  김밥: '🍙', 라면: '🍜', 떡볶이: '🌶️', 돈가스: '🍖', 짜장면: '🥡', 초밥: '🍣', 피자: '🍕', 햄버거: '🍔',
};

export const formatItem = (round: number, item: string) => {
  if (round === 2) return `${Math.floor(Number(item) / 4) + 1}행 ${(Number(item) % 4) + 1}열`;
  if (round === 3) return `${MENU_EMOJI[item] ?? ''} ${item}`;
  if (round === 4) return `${item}번`;
  return item;
};

type Mark = 'correct' | 'wrong' | null;

const markClass = (mark: Mark) =>
  mark === 'correct' ? 'ring-4 ring-success' : mark === 'wrong' ? 'ring-4 ring-danger' : '';

// 한 사람이 보여 주는 선호
export const PersonItems: FC<{ round: number; items: string[] }> = ({ round, items }) => {
  if (round === 1) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day) => (
          <div key={day} className={`w-14 h-14 rounded-lg flex items-center justify-center text-xl font-bold border-2 ${
            items.includes(day) ? 'bg-primary text-white border-primary' : 'opacity-30 border-border-light dark:border-border-dark'}`}>
            {day}
          </div>
        ))}
      </div>
    );
  }
  if (round === 2) {
    return (
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#e8e0c8] dark:bg-[#5c6b5b] rounded-lg">
        {MAP_CELLS.map((cell) => (
          <div key={cell} className="w-16 h-16 rounded flex items-center justify-center text-3xl bg-white/60 dark:bg-black/20">
            {items.includes(cell) ? '📍' : ''}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3 justify-center max-w-xl">
      {items.map((item) => (
        <div key={item} className="px-5 py-3 rounded-lg border-2 border-primary text-2xl font-bold bg-surface-light dark:bg-surface-dark">
          {round === 4 ? `🚌 ${item}` : formatItem(round, item)}
        </div>
      ))}
    </div>
  );
};

interface OptionsProps {
  round: number;
  options: string[];
  disabled: boolean;
  onSelect: (option: string) => void;
  marks?: Record<string, Mark>;
}

// 질문 화면의 선택지
export const AppointmentOptions: FC<OptionsProps> = ({ round, options, disabled, onSelect, marks = {} }) => {
  const button = (option: string, className: string, label: string) => (
    <button key={option} type="button" disabled={disabled} onClick={() => onSelect(option)}
      aria-label={formatItem(round, option)}
      className={`rounded-lg border-2 border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:bg-primary-light dark:hover:bg-primary-dark disabled:cursor-default ${className} ${markClass(marks[option] ?? null)}`}>
      {label}
    </button>
  );

  if (round === 2) {
    return (
      <div className="grid grid-cols-4 gap-1 p-2 bg-[#e8e0c8] dark:bg-[#5c6b5b] rounded-lg">
        {options.map((cell) => button(cell, 'w-16 h-16', ''))}
      </div>
    );
  }
  if (round === 1) {
    return <div className="grid grid-cols-7 gap-2">{options.map((d) => button(d, 'w-14 h-14 text-xl font-bold', d))}</div>;
  }
  return (
    <div className="grid grid-cols-4 gap-3">
      {options.map((o) => button(o, 'px-4 py-3 text-xl font-bold', round === 4 ? `🚌 ${o}` : formatItem(round, o)))}
    </div>
  );
};

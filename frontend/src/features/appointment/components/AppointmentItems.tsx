import { FC, ReactNode } from 'react';
import { PLACES } from '../logic/AppointmentEngine';

const MENU_EMOJI: Record<string, string> = {
  김밥: '🍙', 라면: '🍜', 떡볶이: '🌶️', 돈가스: '🍖', 짜장면: '🥡', 초밥: '🍣', 피자: '🍕', 햄버거: '🍔',
};

// 마을 지도의 건물 16채(왼쪽 위부터 행 순서)
const BUILDINGS = [
  ['🏠', '집'], ['🏫', '학교'], ['🏥', '병원'], ['🏦', '은행'],
  ['🏪', '편의점'], ['⛪', '교회'], ['🏨', '호텔'], ['🏢', '회사'],
  ['🏛️', '박물관'], ['🏬', '백화점'], ['🏤', '우체국'], ['🏟️', '경기장'],
  ['🏰', '성'], ['🏯', '한옥'], ['🏭', '공장'], ['⛲', '공원'],
];

export const formatItem = (round: number, item: string) => {
  if (round === 2) return BUILDINGS[Number(item)].join(' ');
  if (round === 3) return `${MENU_EMOJI[item] ?? ''} ${item}`;
  if (round === 4) return `${item}번`;
  return item;
};

type Mark = 'correct' | 'wrong' | null;

const markClass = (mark: Mark) =>
  mark === 'correct' ? 'ring-4 ring-success' : mark === 'wrong' ? 'ring-4 ring-danger' : '';

// 길(회색 띠)로 나뉜 네 블록에 건물이 2×2 씩 있는 마을 지도
const TownMap: FC<{ renderBuilding: (place: string, label: string) => ReactNode }> = ({ renderBuilding }) => {
  const block = (rows: number[], cols: number[]) => (
    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#e8e0c8] dark:bg-[#6b7a6a]">
      {rows.flatMap((r) => cols.map((c) => {
        const place = PLACES[r * 4 + c];
        return <div key={place}>{renderBuilding(place, formatItem(2, place))}</div>;
      }))}
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-[#6b6b6b]">
      {block([0, 1], [0, 1])}{block([0, 1], [2, 3])}{block([2, 3], [0, 1])}{block([2, 3], [2, 3])}
    </div>
  );
};

// 한 사람이 보여 주는 선호
export const PersonItems: FC<{ round: number; items: string[] }> = ({ round, items }) => {
  // 요일은 그 사람이 고른 카드만, 받은 순서 그대로 보여 준다(예: 일 · 금 · 목). 7장은 마지막 선택 화면에만 나온다.
  if (round === 1) {
    return (
      <div className="flex gap-3 justify-center">
        {items.map((day) => (
          <div key={day} className="w-20 h-24 rounded-lg flex items-center justify-center text-3xl font-bold border-2 bg-primary text-white border-primary">
            {day}
          </div>
        ))}
      </div>
    );
  }
  if (round === 2) {
    return <TownMap renderBuilding={(place, label) => (
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-4xl ${
        items.includes(place) ? 'bg-white ring-4 ring-primary' : 'bg-white/50 opacity-40'}`} title={label}>
        {BUILDINGS[Number(place)][0]}
      </div>
    )} />;
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
    return <TownMap renderBuilding={(place) => button(place, 'w-16 h-16 text-4xl bg-white! dark:bg-white!', BUILDINGS[Number(place)][0])} />;
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

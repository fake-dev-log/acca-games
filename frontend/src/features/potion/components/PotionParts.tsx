import { FC } from 'react';
import { INGREDIENTS } from '../logic/PotionEngine';
import { PotionColor } from '../logic/types';

// 2×2 재료 카드. combo 에 든 카드만 앞면.
export const IngredientCards: FC<{ combo: number[]; size?: 'lg' | 'sm' }> = ({ combo, size = 'lg' }) => {
  const box = size === 'lg' ? 'w-28 h-36 text-5xl' : 'w-7 h-8 text-base';
  return (
    <div className={`grid grid-cols-2 ${size === 'lg' ? 'gap-4' : 'gap-0.5'} w-fit`}>
      {INGREDIENTS.map((ingredient, i) => (
        <div key={ingredient.name} title={combo.includes(i) ? ingredient.name : undefined}
          className={`${box} rounded-lg flex flex-col items-center justify-center border-2 ${
            combo.includes(i)
              ? 'bg-surface-light dark:bg-surface-dark border-primary'
              : 'bg-[repeating-linear-gradient(45deg,#8FAF8A_0_6px,#7D9D7A_6px_12px)] border-transparent opacity-60'}`}>
          {combo.includes(i) && <span>{ingredient.emoji}</span>}
          {combo.includes(i) && size === 'lg' && <span className="text-sm mt-2">{ingredient.name}</span>}
        </div>
      ))}
    </div>
  );
};

export const COLOR_LABEL: Record<PotionColor, string> = { RED: '빨간 약', BLUE: '파란 약' };

export const PotionBadge: FC<{ color: PotionColor | null; label?: string }> = ({ color, label }) => {
  if (color === null) return <span className="opacity-60">{label ?? '-'}</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white font-bold ${color === 'RED' ? 'bg-[#C0504D]' : 'bg-[#4F81BD]'}`}>
      🧪 {label ?? COLOR_LABEL[color]}
    </span>
  );
};

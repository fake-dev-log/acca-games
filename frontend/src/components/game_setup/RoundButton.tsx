import { FC } from 'react';

interface RoundButtonProps {
  level: number;
  text: string;
  isSelected: boolean;
  onClick: (level: number) => void;
}

export const RoundButton: FC<RoundButtonProps> = ({ level, text, isSelected, onClick }) => {
  const baseClasses = 'py-3 px-4 rounded-lg transition-colors text-base';
  const selectedClasses = 'bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark shadow-md';
  const unselectedClasses = 'bg-button-primary-disabled-light dark:bg-button-primary-disabled-dark text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark';

  return (
    <button
      type="button"
      onClick={() => onClick(level)}
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}>
      {text}
    </button>
  );
};

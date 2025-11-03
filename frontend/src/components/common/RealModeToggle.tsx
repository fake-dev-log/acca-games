import { FC } from 'react';

interface RealModeToggleProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RealModeToggle: FC<RealModeToggleProps> = ({ checked, onChange }) => {
  return (
    <div className="flex items-center justify-center pt-2">
      <input
        id="isRealMode"
        name="isRealMode"
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-primary-light dark:text-primary-dark border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark bg-surface-light dark:bg-surface-dark"
      />
      <label htmlFor="isRealMode" className="ml-2 block text-base font-medium text-text-light dark:text-text-dark">
        실전 모드 (피드백 없음)
      </label>
    </div>
  );
};

import { FC } from 'react';

interface NumberInputProps {
  id: string;
  name: string;
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number | string;
  max?: number | string;
  step?: number | string;
}

export const NumberInput: FC<NumberInputProps> = ({ id, name, label, value, onChange, min, max, step }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-medium text-text-light dark:text-text-dark">
        {label}
      </label>
      <input
        type="number"
        id={id}
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="mt-2 block w-full p-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark text-center"
      />
    </div>
  );
};

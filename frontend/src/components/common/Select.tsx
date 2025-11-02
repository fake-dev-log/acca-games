import { SelectHTMLAttributes, ReactNode } from 'react';
import { DropdownIcon } from './DropdownIcon';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  children: ReactNode;
}

export const Select = ({ label, children, ...props }: SelectProps) => {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-on-surface">{label}</label>
      <div className="relative mt-1">
        <select
          {...props}
          className="block w-full p-2 border rounded-md bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark appearance-none focus:outline-none focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark pr-10"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <DropdownIcon />
        </div>
      </div>
    </div>
  );
};

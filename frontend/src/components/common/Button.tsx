import { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-primary-light dark:bg-primary-dark text-white border-primary-light dark:border-primary-dark hover:opacity-90 focus:ring-primary-light dark:focus:ring-primary-dark',
  secondary: 'bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark border-2 border-divider-light dark:border-divider-dark hover:bg-divider-light dark:hover:bg-divider-dark focus:ring-divider-light dark:focus:ring-divider-dark',
  danger: 'bg-danger text-white border-danger hover:bg-button-danger-hover-light dark:hover:bg-button-danger-hover-dark focus:ring-danger dark:focus:ring-danger-dark',
  disabled: 'bg-button-primary-disabled-light dark:bg-button-primary-disabled-dark text-button-disabled-text-light dark:text-button-disabled-text-dark border-button-primary-disabled-light dark:border-button-primary-disabled-dark cursor-not-allowed',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: keyof typeof variants;
}

export const Button = ({ children, className = '', variant = 'primary', ...props }: ButtonProps) => {
  return (
    <button
      className={`py-3 px-12 text-xl rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

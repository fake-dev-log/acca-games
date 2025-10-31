import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export const PrimaryButton = ({ children, className = '', ...props }: PrimaryButtonProps) => {
  return (
    <button
      className={`py-3 px-12 text-xl rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 
        ${className} 
        ${className.includes('bg-') ? '' : 'bg-primary-light dark:bg-primary-dark'} 
        ${className.includes('text-') ? '' : 'text-text-light dark:text-text-dark'} 
        ${className.includes('border-') ? '' : 'border border-primary-light dark:border-primary-dark'} 
        ${className.includes('hover:bg-') ? '' : 'hover:bg-button-primary-hover-light dark:hover:bg-button-primary-hover-dark'} 
        ${className.includes('focus:ring-') ? '' : 'focus:ring-primary-light dark:focus:ring-primary-dark'}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

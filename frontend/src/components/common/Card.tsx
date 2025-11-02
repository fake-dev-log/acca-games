import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div className={`bg-surface p-4 rounded-lg shadow-sm text-on-surface ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
};

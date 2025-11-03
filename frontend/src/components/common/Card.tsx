import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  bordered?: boolean;
  isAnimated?: boolean;
  onAnimationEnd?: () => void;
}

export const Card = ({ children, title, className = '', bordered = false, isAnimated = false, onAnimationEnd }: CardProps) => {
  const borderClass = bordered ? 'border-2 border-primary-light dark:border-primary-dark' : '';
  const animationClass = isAnimated ? 'card-border-highlight-dark dark:card-border-highlight-light' : '';

  return (
    <div 
      className={`bg-surface p-4 rounded-lg shadow-sm text-on-surface ${borderClass} ${animationClass} ${className}`}
      onAnimationEnd={onAnimationEnd}
    >
      {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
      {children}
    </div>
  );
};

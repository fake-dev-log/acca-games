import { ReactNode, useEffect, useState } from 'react';
import { useThemeStore } from '@stores/themeStore';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  bordered?: boolean;
  isAnimated?: boolean;
  onAnimationEnd?: () => void;
}

export const Card = ({ children, title, className = '', bordered = false, isAnimated = false, onAnimationEnd }: CardProps) => {
  const { theme } = useThemeStore();
  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  useEffect(() => {
    if (theme === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(systemIsDark ? 'dark' : 'light');
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const borderClass = bordered ? 'border-2 border-border-light dark:border-border-dark' : '';
  const animationClass = isAnimated 
    ? (effectiveTheme === 'dark' ? 'card-border-highlight-dark' : 'card-border-highlight-light') 
    : '';

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

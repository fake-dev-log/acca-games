import { FC, ReactNode } from 'react';

interface GameLayoutProps {
  children: ReactNode;
  onExit: () => void;
}

export const GameLayout: FC<GameLayoutProps> = ({ children, onExit }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark relative p-4">
      <button onClick={onExit} className="absolute top-4 right-4 px-4 py-2 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark rounded-md hover:bg-primary-light dark:hover:bg-primary-dark hover:text-text-light dark:hover:text-text-dark z-20">
        나가기
      </button>
      {children}
    </div>
  );
};

import { useNavigate } from 'react-router-dom';
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  backPath: string;
  title: string;
}

export const PageLayout = ({ children, backPath, title }: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center relative p-4 overflow-y-auto bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      <button onClick={() => navigate(backPath)} className="absolute top-4 left-4 px-4 py-2 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark rounded-md hover:bg-accent-light dark:hover:bg-accent-dark hover:text-text-light dark:hover:text-text-dark">
        뒤로가기
      </button>
      <div className="flex flex-col flex-grow items-center justify-center w-full">
        <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
};

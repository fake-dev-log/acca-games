import { PageLayout } from '@layout/PageLayout';
import { ReactNode } from "react";

interface GridSelectionLayoutProps {
  title: string;
  backPath: string;
  children: ReactNode;
  gridCols?: string; // e.g., "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
}

export const GridSelectionLayout = ({ title, backPath, children, gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }: GridSelectionLayoutProps) => {
  return (
    <PageLayout backPath={backPath} title={title}>
      <div className="text-center w-full max-w-4xl">
        <div className={`grid gap-6 ${gridCols}`}>
          {children}
        </div>
      </div>
    </PageLayout>
  );
};

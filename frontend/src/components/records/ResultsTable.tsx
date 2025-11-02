import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
}

interface ResultsTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export const ResultsTable = <T extends {}>({ columns, data }: ResultsTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-surface border border-gray-200 text-on-surface">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="py-2 px-4 border-b">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-primary hover:text-on-primary">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-2 px-4 border-b text-center">{col.accessor(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

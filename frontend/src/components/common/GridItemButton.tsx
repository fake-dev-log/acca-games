import { Link } from 'react-router-dom';

interface GridItemButtonProps {
  to: string;
  title: string;
  description: string;
}

export const GridItemButton = ({ to, title, description }: GridItemButtonProps) => {
  return (
    <Link to={to} className={"block rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"}>
      <div className={"border rounded-lg p-6 shadow-sm bg-primary-light dark:bg-primary-dark text-text-light dark:text-text-dark hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer h-full"}>
        <h2 className={"font-bold text-xl mb-2"}>{title}</h2>
        <p className={"text-text-light dark:text-text-dark opacity-75"}>{description}</p>
      </div>
    </Link>
  );
};

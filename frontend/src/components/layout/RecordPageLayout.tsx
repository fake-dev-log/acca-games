import { useState, ReactNode, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'; // Assuming react-icons is installed

interface RecordPageLayoutProps {
  title: string;
  backPath: string;
  children: ReactNode;
  sidebarContent: ReactNode;
}

export const RecordPageLayout: FC<RecordPageLayoutProps> = ({ title, backPath, children, sidebarContent }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-row-reverse h-full w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 bg-surface text-on-surface shadow-lg transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-80 p-4' : 'w-0 overflow-hidden'}`}
      >
        {isSidebarOpen && (
          <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4">세션 목록</h3>
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {sidebarContent}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-4">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate(backPath)} className="mr-4 p-2 rounded-full hover:bg-primary-light dark:hover:bg-primary-dark transition-colors duration-200">
            <IoIosArrowBack className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-extrabold">{title}</h1>
        </div>

        <div className="flex-grow bg-surface text-on-surface rounded-lg shadow-lg p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1/2 -translate-y-1/2 z-10 p-2 bg-primary text-on-primary rounded-l-lg shadow-md
          transition-all duration-300 ease-in-out
          hover:bg-primary-dark
          focus:outline-none focus:ring-2 focus:ring-primary-light"
        style={{ right: isSidebarOpen ? '20rem' : '0' }} // Adjust based on sidebar width (w-80 = 20rem)
      >
        {isSidebarOpen ? <IoIosArrowForward className="w-5 h-5" /> : <IoIosArrowBack className="w-5 h-5" />}
      </button>
    </div>
  );
};

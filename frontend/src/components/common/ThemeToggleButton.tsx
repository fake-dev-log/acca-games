import { useEffect, useState } from 'react';
import { useThemeStore } from '@stores/themeStore';
import { SunIcon } from '../icons/SunIcon';
import { MoonIcon } from '../icons/MoonIcon';

export const ThemeToggleButton = () => {
  const { theme, setTheme } = useThemeStore();
  const [effectiveTheme, setEffectiveTheme] = useState(theme);

  useEffect(() => {
    if (theme === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setEffectiveTheme(systemIsDark ? 'dark' : 'light');
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);

  const isDark = effectiveTheme === 'dark';

  const handleToggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-between w-full py-2 px-4 text-xl rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200
                 bg-button-primary-disabled-light dark:bg-button-primary-disabled-dark
                 text-text-light dark:text-text-dark
                 hover:bg-background-light dark:hover:bg-background-dark"
    >
      <div className="flex-1"></div>
      <div className="flex-none">테마</div>
      <div className="flex-1 flex justify-end">
        <div className="relative flex items-center w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700">
          <div
            className={`absolute left-0 flex items-center justify-center w-6 h-6 rounded-full transition-transform duration-300 ease-in-out
                        ${isDark ? 'transform translate-x-full bg-gray-900' : 'bg-white'}`}
          >
            {isDark ? (
              <MoonIcon className="text-yellow-300" />
            ) : (
              <SunIcon className="text-yellow-500" />
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

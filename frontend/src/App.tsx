import './App.css';
import RoutesProvider from "@routes/RoutesProvider";
import { useThemeStore } from '@stores/themeStore';
import { useEffect } from 'react';

function App() {
    const { theme } = useThemeStore();

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.toggle('dark', isDark);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <div id={"app"} className={"bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark min-h-screen"}>
            <RoutesProvider />
        </div>
    )
}

export default App

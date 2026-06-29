import { createContext, useState, useEffect } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider value={{ theme, toggleTheme, isSidebarOpen, toggleSidebar }}>
      {children}
    </AppContext.Provider>
  );
};

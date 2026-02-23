import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('shopsphere-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('shopsphere-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const themeValue = useMemo(
    () => ({
      darkMode,
      toggleDarkMode: () => setDarkMode((prev) => !prev),
    }),
    [darkMode]
  );

  return (
    <ThemeProvider value={themeValue}>
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;

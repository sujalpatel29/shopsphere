import { useEffect, useMemo, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import FloatingThemeToggle from './components/layout/FloatingThemeToggle';
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
    <AuthProvider>
        <ThemeProvider value={themeValue}>
          <AppRoutes />
          <FloatingThemeToggle />
        </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

import { Moon, Sun } from "lucide-react";
import { Button } from "primereact/button";
import { useTheme } from "../../context/ThemeContext";

function FloatingThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      type="button"
      onClick={toggleDarkMode}
      className="fixed bottom-5 right-5 z-[90] !inline-flex !items-center !gap-2 !rounded-full !border-2 !border-amber-600 !bg-white !px-4 !py-2 !text-sm !font-semibold !text-amber-600 !shadow-lg !shadow-amber-600/20 hover:!bg-amber-50 dark:!bg-[#151e22] dark:!text-amber-400 dark:hover:!bg-[#1a2327]"
      aria-label="Toggle dark mode"
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span>{darkMode ? "Light" : "Dark"}</span>
    </Button>
  );
}

export default FloatingThemeToggle;

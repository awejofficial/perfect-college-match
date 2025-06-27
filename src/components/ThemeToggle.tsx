
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="glass-button rounded-full w-10 h-10 relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      <div className={`transition-all duration-300 ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`}>
        <Sun className="h-4 w-4" />
      </div>
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`}>
        <Moon className="h-4 w-4" />
      </div>
    </Button>
  );
};

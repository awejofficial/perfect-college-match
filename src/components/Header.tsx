
import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-white/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="glass rounded-full p-2 nvidia-glow">
              <GraduationCap className="h-6 w-6 text-nvidia-green" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              DSE College Finder
            </h1>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

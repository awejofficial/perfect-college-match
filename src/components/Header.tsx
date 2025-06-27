
import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border transition-nvidia">
      <div className="container-nvidia">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-nvidia-green/10 rounded-lg">
              <GraduationCap className="h-6 w-6 text-nvidia-green" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                College Finder
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Engineering Guidance</p>
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white backdrop-blur-sm border-b border-gray-200 transition-nvidia">
      <div className="container-nvidia">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg">
              <GraduationCap className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-black">
                College Finder
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">Engineering Guidance</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

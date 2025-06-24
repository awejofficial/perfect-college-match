
import React from 'react';
import { Github, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-lg font-medium">
              Made with ❤️ by <span className="text-blue-400 font-bold">Awej</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              DSE College Finder - Helping students find their perfect college match
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://instagram.com/awej04"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-400 transition-colors duration-200"
              aria-label="Follow on Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            
            <a
              href="https://github.com/awejofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
              aria-label="Visit GitHub profile"
            >
              <Github className="h-6 w-6" />
            </a>
            
            <a
              href="https://linkedin.com/in/awej-pathan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-4 pt-4 text-center">
          <p className="text-xs text-gray-500">
            © 2024 DSE College Finder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

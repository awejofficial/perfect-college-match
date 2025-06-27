
import React from 'react';
import { Github, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container-nvidia py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-nvidia-green/10 rounded-lg">
                <div className="w-6 h-6 bg-nvidia-green rounded-sm"></div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">College Finder</h3>
                <p className="text-sm text-muted-foreground">Engineering Guidance Platform</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              Empowering students to make informed decisions about their engineering education 
              through data-driven insights and personalized guidance.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com/awej04"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-nvidia-green transition-nvidia focus-nvidia"
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              
              <a
                href="https://github.com/awejofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-nvidia-green transition-nvidia focus-nvidia"
                aria-label="Visit GitHub profile"
              >
                <Github className="h-5 w-5" />
              </a>
              
              <a
                href="https://linkedin.com/in/awej-pathan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-nvidia-green transition-nvidia focus-nvidia"
                aria-label="Connect on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['College Search', 'Cutoff Predictor', 'Branch Guide', 'Success Stories'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-muted-foreground hover:text-nvidia-green transition-nvidia">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-sm">support@collegefinder.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 12345 67890</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Mumbai, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 College Finder. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-nvidia-green transition-nvidia">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-nvidia-green transition-nvidia">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

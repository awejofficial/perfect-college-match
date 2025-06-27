
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 glass-hero rounded-full animate-float opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 glass-hero rounded-full animate-float opacity-20" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 glass-hero rounded-full animate-float opacity-10" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero content */}
          <div className="glass-hero rounded-3xl p-12 mb-8">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-nvidia-green mr-3 animate-pulse" />
              <span className="text-nvidia-green font-semibold text-lg">AI-Powered College Discovery</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Find Your
              <span className="block text-nvidia-green animate-glow-pulse">
                Perfect College
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              Discover the best colleges in Maharashtra based on real cutoff data, 
              your academic performance, and personal preferences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onStartClick}
                size="lg"
                className="glass-button px-8 py-4 text-lg rounded-full group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-nvidia-green rounded-full animate-pulse"></div>
                <span>2024 Cutoff Data Available</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { number: '500+', label: 'Colleges Listed' },
              { number: '50+', label: 'Engineering Branches' },
              { number: '99%', label: 'Accuracy Rate' }
            ].map((stat, index) => (
              <div key={stat.label} className="glass-card rounded-2xl p-6">
                <div className="text-3xl font-bold text-nvidia-green mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

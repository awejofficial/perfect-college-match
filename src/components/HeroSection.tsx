
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container-responsive">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-hero p-8 lg:p-12 mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2 bg-nvidia-green/10 text-nvidia-green px-4 py-2 rounded-full text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>AI-Powered Predictions</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-nvidia-green">Engineering College</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover engineering colleges in Maharashtra based on real cutoff data, 
              your academic performance, and preferences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStartClick}
                className="btn-primary text-lg px-8 py-4 group"
              >
                <span className="flex items-center">
                  Start Your Search
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '500+', label: 'Colleges Listed', desc: 'Comprehensive database' },
              { number: '50+', label: 'Engineering Branches', desc: 'All major streams' },
              { number: '99%', label: 'Accuracy Rate', desc: 'Real cutoff data' }
            ].map((stat, index) => (
              <div key={stat.label} className="card-minimal text-center">
                <div className="text-3xl font-bold text-nvidia-green mb-2">{stat.number}</div>
                <div className="font-medium text-foreground mb-1">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

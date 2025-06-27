
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, TrendingUp, Users } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  return (
    <section className="hero-section py-20 lg:py-32">
      <div className="container-nvidia">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Main Hero Content */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-nvidia-green/10 text-nvidia-green px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              <span>Precision Engineering Guidance</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect
              <span className="block text-nvidia-green mt-2">Engineering College</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover engineering colleges in Maharashtra with real-time cutoff data, 
              intelligent matching, and personalized recommendations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onStartClick}
                className="btn-nvidia text-lg px-8 py-4 group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                className="btn-secondary text-lg px-8 py-4"
              >
                View Demo
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            {[
              { 
                icon: Users,
                number: '10K+', 
                label: 'Students Guided', 
                desc: 'Successful placements' 
              },
              { 
                icon: Target,
                number: '500+', 
                label: 'Colleges Listed', 
                desc: 'Comprehensive database' 
              },
              { 
                icon: TrendingUp,
                number: '99%', 
                label: 'Accuracy Rate', 
                desc: 'Real-time data' 
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card-professional text-center group">
                  <div className="flex items-center justify-center w-12 h-12 bg-nvidia-green/10 rounded-lg mx-auto mb-4 group-hover:bg-nvidia-green/20 transition-nvidia">
                    <Icon className="h-6 w-6 text-nvidia-green" />
                  </div>
                  <div className="text-3xl font-bold text-nvidia-green mb-2">{stat.number}</div>
                  <div className="font-semibold text-foreground mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

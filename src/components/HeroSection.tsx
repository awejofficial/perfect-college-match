
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, TrendingUp, Users } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  return (
    <section className="hero-section py-20 lg:py-32 bg-white">
      <div className="container-nvidia">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {/* Main Hero Content */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Target className="h-4 w-4" />
              <span>Precision Engineering Guidance</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-black mb-8 leading-tight">
              Find Your Perfect
              <span className="block text-black mt-2">Engineering College</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
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
                className="btn-minimal text-lg px-8 py-4"
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
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-4 group-hover:bg-gray-200 transition-all duration-200">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                  <div className="text-3xl font-bold text-black mb-2">{stat.number}</div>
                  <div className="font-semibold text-black mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};


import React from 'react';
import { Search, TrendingUp, FileText, Target } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'College Explorer',
    description: 'Discover colleges based on your preferences, location, and academic performance with comprehensive filters.',
  },
  {
    icon: Target,
    title: 'Cutoff Predictor',
    description: 'Get accurate cutoff predictions based on historical data and current admission trends.',
  },
  {
    icon: TrendingUp,
    title: 'Result Analyzer',
    description: 'Analyze your chances and compare different colleges with detailed insights and statistics.',
  },
  {
    icon: FileText,
    title: 'Smart Reports',
    description: 'Generate comprehensive reports with personalized recommendations for your college journey.',
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make informed decisions about your college admissions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-6 group"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-nvidia-green/10 rounded-lg mb-6 group-hover:bg-nvidia-green/20 transition-colors">
                  <Icon className="h-6 w-6 text-nvidia-green" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

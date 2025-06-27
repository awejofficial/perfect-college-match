
import React from 'react';
import { Search, TrendingUp, FileText, Target } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'College Explorer',
    description: 'Discover colleges based on your preferences, location, and academic performance.',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Target,
    title: 'Cutoff Predictor',
    description: 'Get accurate cutoff predictions based on historical data and current trends.',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    icon: TrendingUp,
    title: 'Result Analyzer',
    description: 'Analyze your chances and compare different colleges with detailed insights.',
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    icon: FileText,
    title: 'Smart Reports',
    description: 'Generate comprehensive reports with personalized recommendations.',
    color: 'from-orange-500/20 to-red-500/20'
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make informed decisions about your college admissions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-6 group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`glass-card rounded-full w-16 h-16 flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8 text-nvidia-green" />
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

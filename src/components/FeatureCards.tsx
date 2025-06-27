
import React from 'react';
import { Search, TrendingUp, FileText, Target, Users, BookOpen } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Smart College Search',
    description: 'Advanced filtering system to find colleges that match your academic profile and preferences.',
  },
  {
    icon: Target,
    title: 'Cutoff Predictor',
    description: 'AI-powered predictions based on historical data and current admission trends.',
  },
  {
    icon: TrendingUp,
    title: 'Eligibility Analyzer',
    description: 'Real-time analysis of your admission chances with detailed insights.',
  },
  {
    icon: FileText,
    title: 'Comprehensive Reports',
    description: 'Generate detailed reports with personalized college recommendations.',
  },
  {
    icon: Users,
    title: 'Peer Comparison',
    description: 'Compare your profile with successful students from previous years.',
  },
  {
    icon: BookOpen,
    title: 'Branch Guidance',
    description: 'Detailed information about engineering branches and career prospects.',
  }
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-nvidia">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-black mb-4">
            Why Choose Our Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools and insights to make informed decisions about your engineering career
          </p>
        </div>

        <div className="grid-nvidia-4 animate-slide-up">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="card-professional group animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-6 group-hover:bg-gray-200 transition-all duration-200">
                  <Icon className="h-7 w-7 text-black" />
                </div>
                
                <h3 className="text-xl font-semibold text-black mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
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

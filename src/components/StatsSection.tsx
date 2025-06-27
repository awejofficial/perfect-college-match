
import React from 'react';

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-fade-in-up">
            <div className="text-4xl font-bold text-violet-400 mb-2">10,000+</div>
            <div className="text-slate-300">Students Helped</div>
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <div className="text-4xl font-bold text-violet-400 mb-2">500+</div>
            <div className="text-slate-300">Colleges Listed</div>
          </div>
          <div className="animate-fade-in-up animation-delay-400">
            <div className="text-4xl font-bold text-violet-400 mb-2">95%</div>
            <div className="text-slate-300">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

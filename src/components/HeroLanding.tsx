
import React from 'react';
import { GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroLandingProps {
  onStartJourney: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ onStartJourney }) => {
  return (
    <section className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <GraduationCap className="h-16 w-16 text-yellow-300" />
            <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Find Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300"> College</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-purple-100 leading-relaxed max-w-3xl mx-auto">
            Discover colleges that match your marks with our advanced cutoff analysis system. 
            Make informed decisions for your academic future.
          </p>
          <Button 
            onClick={onStartJourney}
            size="lg"
            className="bg-white text-violet-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12 py-6 text-lg font-bold rounded-2xl"
          >
            Start Your Journey
            <TrendingUp className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};


import React from 'react';
import { TrendingUp, Users, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const FeatureSectionCards: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Advanced features designed to help you make the best college choice
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="animate-slide-in-left hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Real-time Cutoff Data</CardTitle>
              <CardDescription>
                Access the most up-to-date cutoff information from official sources to make accurate predictions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-scale-in animation-delay-200 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Personalized Matching</CardTitle>
              <CardDescription>
                Get college recommendations tailored to your specific marks, category, and preferences.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-slide-in-right hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Comprehensive Analysis</CardTitle>
              <CardDescription>
                Detailed insights into college options including location, type, and admission probability.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

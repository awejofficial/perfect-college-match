
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, GraduationCap } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface FormStepperProps {
  currentStep: number;
  isAnalyzing: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export const FormStepper: React.FC<FormStepperProps> = ({
  currentStep,
  isAnalyzing,
  onNext,
  onPrev,
  onSubmit
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 mt-6 border-0">
      <div className="flex justify-between items-center">
        {currentStep > 1 ? (
          <Button 
            variant="secondary" 
            onClick={onPrev}
            className="glass-button border-0 text-white hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div></div>
        )}

        <div className="flex items-center space-x-2 text-white">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step === currentStep
                    ? 'bg-white scale-125'
                    : step < currentStep
                    ? 'bg-green-400'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {currentStep < 3 ? (
          <Button 
            onClick={onNext}
            className="glass-button border-0 text-white hover:text-white"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={onSubmit} 
            disabled={isAnalyzing}
            className="glass-button border-0 text-white hover:text-white disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                Analyzing...
                <LoadingSpinner />
              </>
            ) : (
              <>
                Find Colleges
                <GraduationCap className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

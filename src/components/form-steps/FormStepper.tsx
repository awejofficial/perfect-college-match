
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
    <div className="minimal-card mt-6">
      <div className="flex justify-between items-center">
        {currentStep > 1 ? (
          <Button 
            variant="outline" 
            onClick={onPrev}
            className="btn-minimal"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div></div>
        )}

        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  step === currentStep
                    ? 'bg-nvidia-green'
                    : step < currentStep
                    ? 'bg-foreground'
                    : 'bg-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>

        {currentStep < 3 ? (
          <Button 
            onClick={onNext}
            className="btn-nvidia"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={onSubmit} 
            disabled={isAnalyzing}
            className="btn-nvidia disabled:opacity-50"
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

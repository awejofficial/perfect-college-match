
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
    <div className="flex justify-between mt-4">
      {currentStep > 1 ? (
        <Button variant="secondary" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
      ) : (
        <div></div>
      )}

      {currentStep < 3 ? (
        <Button onClick={onNext}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onSubmit} disabled={isAnalyzing}>
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
  );
};

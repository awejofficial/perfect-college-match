
import React, { useState } from 'react';
import { GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { HeroLanding } from "@/components/HeroLanding";
import { FeatureSectionCards } from "@/components/FeatureSectionCards";
import { StatsSection } from "@/components/StatsSection";
import { ResultsView } from "@/components/ResultsView";
import { LoadingView } from "@/components/LoadingView";
import { 
  WelcomeStep,
  PersonalInfoStep,
  AcademicDetailsStep,
  PreferencesStep,
  FormStepper
} from "@/components/form-steps";
import { useCollegeData } from "@/hooks/useCollegeData";
import { useCollegeAnalysis } from "@/hooks/useCollegeAnalysis";

interface CollegeType {
  value: string;
  label: string;
}

interface CollegeSelection {
  collegeName: string;
  collegeType: string;
  selectedBranches: string[];
  availableBranches: string[];
  expanded: boolean;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    aggregate: '',
    category: '',
    preferredBranches: [] as string[],
    collegeTypes: [] as string[],
    selectedColleges: [] as string[],
    collegeSelections: [] as CollegeSelection[]
  });

  const { availableCategories, availableBranches, isLoadingOptions } = useCollegeData();
  const { isAnalyzing, results, analyzeColleges } = useCollegeAnalysis();

  const collegeTypeOptions: CollegeType[] = [
    { value: 'Government', label: 'Government' },
    { value: 'Government Autonomous', label: 'Government Autonomous' },
    { value: 'Private', label: 'Private' },
  ];

  const validateForm = () => {
    const errors = [];
    
    if (!formData.fullName.trim()) {
      errors.push("Full name is required");
    }
    
    if (!formData.aggregate || isNaN(parseFloat(formData.aggregate))) {
      errors.push("Valid aggregate percentage is required");
    } else {
      const aggregate = parseFloat(formData.aggregate);
      if (aggregate < 0 || aggregate > 100) {
        errors.push("Aggregate percentage must be between 0 and 100");
      }
    }
    
    if (!formData.category) {
      errors.push("Category selection is required");
    }
    
    if (formData.preferredBranches.length === 0) {
      errors.push("At least one branch must be selected");
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      toast({
        title: "Incomplete Form",
        description: errors.join(". "),
        variant: "destructive"
      });
      return;
    }

    const success = await analyzeColleges(formData);
    if (success) {
      setShowResults(true);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && isGuest && !formData.fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 2) {
      const errors = [];
      if (!formData.aggregate || isNaN(parseFloat(formData.aggregate))) {
        errors.push("Valid aggregate percentage is required");
      }
      if (!formData.category) {
        errors.push("Category selection is required");
      }
      
      if (errors.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: errors.join(". "),
          variant: "destructive"
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const refillForm = () => {
    setShowResults(false);
    setCurrentStep(1);
    setFormData({
      fullName: '',
      aggregate: '',
      category: '',
      preferredBranches: [],
      collegeTypes: [],
      selectedColleges: [],
      collegeSelections: []
    });
    setIsGuest(false);
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    setFormData({ ...formData, fullName: 'Guest User' });
  };

  const handleEmailLogin = () => {
    window.location.href = '/auth';
  };

  const handleCollegeTypeChange = (collegeType: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        collegeTypes: [...formData.collegeTypes, collegeType]
      });
    } else {
      setFormData({
        ...formData,
        collegeTypes: formData.collegeTypes.filter(type => type !== collegeType)
      });
    }
  };

  const handleBranchChange = (branch: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        preferredBranches: [...formData.preferredBranches, branch]
      });
    } else {
      setFormData({
        ...formData,
        preferredBranches: formData.preferredBranches.filter(b => b !== branch)
      });
    }
  };

  const handleStartJourney = () => {
    setShowForm(true);
  };

  if (showResults) {
    return (
      <ResultsView 
        results={results}
        formData={formData}
        onRefillForm={refillForm}
      />
    );
  }

  if (isLoadingOptions) {
    return <LoadingView />;
  }

  if (!showForm) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="flex-1">
          <HeroLanding onStartJourney={handleStartJourney} />
          <FeatureSectionCards />
          <StatsSection />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-4xl mb-2 flex items-center justify-center gap-3">
                  <GraduationCap className="h-10 w-10" />
                  DSE College Finder 2024
                </CardTitle>
                <CardDescription className="text-violet-100 text-lg">
                  Find eligible colleges based on real cutoff data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {!isGuest && currentStep === 1 && (
            <div className="animate-scale-in">
              <WelcomeStep 
                onGuestAccess={handleGuestAccess}
                onEmailLogin={handleEmailLogin}
              />
            </div>
          )}

          {(isGuest || currentStep > 1) && (
            <div className="animate-fade-in-up">
              {(currentStep === 1 && isGuest) && (
                <PersonalInfoStep
                  fullName={formData.fullName}
                  onFullNameChange={(value) => setFormData({ ...formData, fullName: value })}
                />
              )}

              {currentStep === 2 && (
                <AcademicDetailsStep
                  aggregate={formData.aggregate}
                  category={formData.category}
                  availableCategories={availableCategories}
                  onAggregateChange={(value) => setFormData({ ...formData, aggregate: value })}
                  onCategoryChange={(value) => setFormData({ ...formData, category: value })}
                />
              )}

              {currentStep === 3 && (
                <PreferencesStep
                  preferredBranches={formData.preferredBranches}
                  collegeTypes={formData.collegeTypes}
                  availableBranches={availableBranches}
                  collegeTypeOptions={collegeTypeOptions}
                  onBranchChange={handleBranchChange}
                  onCollegeTypeChange={handleCollegeTypeChange}
                />
              )}

              <FormStepper
                currentStep={currentStep}
                isAnalyzing={isAnalyzing}
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;

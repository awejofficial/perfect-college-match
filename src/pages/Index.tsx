
import React, { useState, useEffect } from 'react';
import { GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollegeResultsTable } from "@/components/CollegeResultsTable";
import { Footer } from "@/components/Footer";
import { 
  WelcomeStep,
  PersonalInfoStep,
  AcademicDetailsStep,
  FormStepper
} from "@/components/form-steps";
import { EnhancedPreferencesStep } from "@/components/form-steps/EnhancedPreferencesStep";
import { 
  fetchCutoffData, 
  fetchAvailableCollegeTypes, 
  fetchAvailableCategories,
  fetchAvailableBranches,
  type CutoffRecord 
} from "@/services/databaseService";

interface CollegeType {
  value: string;
  label: string;
}

interface CollegeMatch {
  collegeName: string;
  city: string;
  branch: string;
  category: string;
  collegeType: string;
  cap1Cutoff: number | null;
  cap2Cutoff: number | null;
  cap3Cutoff: number | null;
  eligible: boolean;
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CollegeMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableCollegeTypes, setAvailableCollegeTypes] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    aggregate: '',
    category: '',
    preferredBranches: [] as string[],
    collegeTypes: [] as string[],
    selectedColleges: [] as string[],
    collegeSelections: [] as CollegeSelection[]
  });

  const collegeTypeOptions: CollegeType[] = [
    { value: 'Government', label: 'Government' },
    { value: 'Government Autonomous', label: 'Government Autonomous' },
    { value: 'Private', label: 'Private' },
  ];

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [categories, branches, collegeTypes] = await Promise.all([
        fetchAvailableCategories(),
        fetchAvailableBranches(),
        fetchAvailableCollegeTypes()
      ]);
      
      console.log('Loaded options:', { categories, branches, collegeTypes });
      
      setAvailableCategories(categories);
      setAvailableBranches(branches);
      setAvailableCollegeTypes(collegeTypes);
    } catch (error) {
      console.error('Failed to load options:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load form options. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const processCollegeMatches = (cutoffData: CutoffRecord[], studentAggregate: number): CollegeMatch[] => {
    // Group by unique combination of college_name, branch_name, category
    const uniqueCombinations = new Map<string, CutoffRecord>();
    
    cutoffData.forEach(record => {
      const key = `${record.college_name}-${record.branch_name}-${record.category}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, record);
      }
    });

    const matches: CollegeMatch[] = Array.from(uniqueCombinations.values()).map(record => {
      // Check eligibility against any available cutoff
      const eligibleForCap1 = record.cap1_cutoff ? studentAggregate >= record.cap1_cutoff : false;
      const eligibleForCap2 = record.cap2_cutoff ? studentAggregate >= record.cap2_cutoff : false;
      const eligibleForCap3 = record.cap3_cutoff ? studentAggregate >= record.cap3_cutoff : false;
      
      const eligible = eligibleForCap1 || eligibleForCap2 || eligibleForCap3;

      return {
        collegeName: record.college_name,
        city: record.city || 'Unknown',
        branch: record.branch_name,
        category: record.category,
        collegeType: record.college_type,
        cap1Cutoff: record.cap1_cutoff || null,
        cap2Cutoff: record.cap2_cutoff || null,
        cap3Cutoff: record.cap3_cutoff || null,
        eligible
      };
    });

    // Sort by eligible first, then by lowest cutoff available
    return matches.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      
      // Get lowest cutoff for sorting
      const getLowestCutoff = (college: CollegeMatch) => {
        const cutoffs = [college.cap1Cutoff, college.cap2Cutoff, college.cap3Cutoff]
          .filter(c => c !== null) as number[];
        return cutoffs.length > 0 ? Math.min(...cutoffs) : 100;
      };
      
      return getLowestCutoff(a) - getLowestCutoff(b);
    });
  };

  const handleSubmit = async () => {
    // Get all selected branches from college selections
    const allSelectedBranches = formData.collegeSelections.flatMap(selection => selection.selectedBranches);
    
    if (!formData.fullName || !formData.aggregate || !formData.category || allSelectedBranches.length === 0) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields, select colleges, and select at least one branch.",
        variant: "destructive"
      });
      return;
    }

    const aggregate = parseFloat(formData.aggregate);
    if (isNaN(aggregate) || aggregate < 0 || aggregate > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Please enter a valid percentage between 0 and 100.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Fetch data for all selected branches
      const allCutoffData: CutoffRecord[] = [];
      
      for (const branch of allSelectedBranches) {
        const branchData = await fetchCutoffData(
          formData.category,
          branch,
          formData.collegeTypes.length > 0 ? formData.collegeTypes : undefined
        );
        allCutoffData.push(...branchData);
      }

      if (allCutoffData.length === 0) {
        toast({
          title: "No Data Available",
          description: "No cutoff data found for your selected criteria. Please try different options or contact admin to upload data.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      console.log('Processing cutoff data:', allCutoffData.length, 'records');
      
      const collegeMatches = processCollegeMatches(allCutoffData, aggregate);
      
      console.log('Processed Results:', collegeMatches);
      
      setResults(collegeMatches);
      setShowResults(true);
      
      const eligibleCount = collegeMatches.filter(college => college.eligible).length;
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${collegeMatches.length} college options (${eligibleCount} eligible) for ${formData.fullName}.`
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze college options. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const refillForm = () => {
    setShowResults(false);
    setCurrentStep(1);
  };

  const handleGuestAccess = () => {
    setIsGuest(true);
    setFormData({ ...formData, fullName: 'Guest User' });
  };

  const handleEmailLogin = () => {
    window.location.href = '/admin-auth';
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

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <GraduationCap className="h-10 w-10 text-blue-600" />
                DSE College Finder 2024
              </h1>
              <p className="text-gray-600">Find eligible colleges for {formData.fullName}</p>
            </div>

            <CollegeResultsTable 
              results={results} 
              studentName={formData.fullName}
              onRefillForm={refillForm}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoadingOptions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading form options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              DSE College Finder 2024
            </h1>
            <p className="text-gray-600">Find eligible colleges in Maharashtra based on real cutoff data</p>
          </div>

          {!isGuest && currentStep === 1 && (
            <WelcomeStep 
              onGuestAccess={handleGuestAccess}
              onEmailLogin={handleEmailLogin}
            />
          )}

          {(isGuest || currentStep > 1) && (
            <>
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
                <EnhancedPreferencesStep
                  preferredBranches={formData.preferredBranches}
                  collegeTypes={formData.collegeTypes}
                  selectedColleges={formData.selectedColleges}
                  collegeSelections={formData.collegeSelections}
                  category={formData.category}
                  onBranchChange={handleBranchChange}
                  onCollegeTypeChange={handleCollegeTypeChange}
                  onCollegeSelectionChange={(colleges) => setFormData({ ...formData, selectedColleges: colleges })}
                  onCollegeSelectionsChange={(selections) => setFormData({ ...formData, collegeSelections: selections })}
                  onCategoryChange={(category) => setFormData({ ...formData, category })}
                />
              )}

              <FormStepper
                currentStep={currentStep}
                isAnalyzing={isAnalyzing}
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;

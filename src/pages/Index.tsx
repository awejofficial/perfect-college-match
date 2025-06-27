import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, TrendingUp, Users, Award, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MinimalResultsTable } from "@/components/MinimalResultsTable";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  WelcomeStep,
  PersonalInfoStep,
  AcademicDetailsStep,
  PreferencesStep,
  FormStepper
} from "@/components/form-steps";
import { 
  fetchCutoffData, 
  fetchAvailableCollegeTypes, 
  fetchAvailableCategories,
  fetchAvailableBranches,
  fetchAllCollegeNames,
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
  const [showForm, setShowForm] = useState(false);

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

    const aggregate = parseFloat(formData.aggregate);
    setIsAnalyzing(true);
    
    try {
      // Use all colleges if none selected specifically
      let collegesToSearch = formData.selectedColleges;
      if (collegesToSearch.length === 0) {
        // Auto-select all available colleges
        const allColleges = await fetchAllCollegeNames();
        collegesToSearch = allColleges;
      }

      console.log('Fetching data for branches:', formData.preferredBranches);
      console.log('Category:', formData.category);
      console.log('College types filter:', formData.collegeTypes);
      console.log('Colleges to search:', collegesToSearch.length);
      
      // Fetch data for all selected branches
      const allCutoffData: CutoffRecord[] = [];
      
      for (const branch of formData.preferredBranches) {
        const branchData = await fetchCutoffData(
          formData.category,
          branch,
          formData.collegeTypes.length > 0 ? formData.collegeTypes : undefined
        );
        allCutoffData.push(...branchData);
      }

      console.log('Total cutoff records found:', allCutoffData.length);

      if (allCutoffData.length === 0) {
        toast({
          title: "No Data Available",
          description: "No cutoff data found for your selected criteria. Try different options or contact admin.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      const collegeMatches = processCollegeMatches(allCutoffData, aggregate);
      console.log('Processed matches:', collegeMatches.length);
      
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
    // Validate current step before proceeding
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <div className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 animate-fade-in-up">
              <Card className="mb-6 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-4xl mb-2 flex items-center justify-center gap-3">
                    <GraduationCap className="h-10 w-10" />
                    DSE College Finder 2024
                  </CardTitle>
                  <CardDescription className="text-emerald-100 text-lg">
                    College Eligibility Results for <strong className="text-white">{formData.fullName}</strong>
                  </CardDescription>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4 inline-block">
                    <div className="text-sm space-y-2">
                      <p><strong>Aggregate:</strong> {formData.aggregate}% | <strong>Category:</strong> {formData.category}</p>
                      <p><strong>Branches:</strong> {formData.preferredBranches.length} | <strong>Colleges:</strong> {formData.selectedColleges.length || 'All'}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <MinimalResultsTable 
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <Card className="text-center animate-scale-in shadow-2xl">
          <CardHeader>
            <LoadingSpinner />
            <CardTitle className="mt-4 text-slate-800">Loading Application...</CardTitle>
            <CardDescription>Preparing your college finder experience</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
        <div className="flex-1">
          {/* Modern Hero Section */}
          <section className="relative bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white py-20 lg:py-32">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
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
                <p className="text-xl lg:text-2xl mb-8 text-cyan-100 leading-relaxed max-w-3xl mx-auto">
                  Discover colleges that match your marks with our advanced cutoff analysis system. 
                  Make informed decisions for your academic future.
                </p>
                <Button 
                  onClick={handleStartJourney}
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12 py-6 text-lg font-bold rounded-2xl"
                >
                  Start Your Journey
                  <TrendingUp className="ml-2 h-6 w-6" />
                </Button>
              </div>
            </div>
          </section>

          {/* Feature Cards Section */}
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
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
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

          {/* Stats Section */}
          <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="animate-fade-in-up">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">10,000+</div>
                  <div className="text-slate-300">Students Helped</div>
                </div>
                <div className="animate-fade-in-up animation-delay-200">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">500+</div>
                  <div className="text-slate-300">Colleges Listed</div>
                </div>
                <div className="animate-fade-in-up animation-delay-400">
                  <div className="text-4xl font-bold text-emerald-400 mb-2">95%</div>
                  <div className="text-slate-300">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <Card className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-4xl mb-2 flex items-center justify-center gap-3">
                  <GraduationCap className="h-10 w-10" />
                  DSE College Finder 2024
                </CardTitle>
                <CardDescription className="text-emerald-100 text-lg">
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

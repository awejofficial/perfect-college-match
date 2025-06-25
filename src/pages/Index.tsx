
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, GraduationCap, User, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollegeResultsTable } from "@/components/CollegeResultsTable";
import { Footer } from "@/components/Footer";
import { fetchCutoffData, fetchAvailableCollegeTypes, type CutoffRecord } from "@/services/databaseService";

interface Category {
  value: string;
  label: string;
}

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

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CollegeMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [availableCollegeTypes, setAvailableCollegeTypes] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    aggregate: '',
    category: '',
    preferredBranches: [] as string[],
    collegeTypes: [] as string[]
  });

  const categories: Category[] = [
    { value: 'GOPEN', label: 'GOPEN' },
    { value: 'GSC', label: 'GSC' },
    { value: 'GSEBC', label: 'GSEBC' },
    { value: 'LOPEN', label: 'LOPEN' },
    { value: 'LST', label: 'LST' },
    { value: 'LOBC', label: 'LOBC' },
    { value: 'EWS', label: 'EWS' },
    { value: 'GST', label: 'GST' },
    { value: 'GOBC', label: 'GOBC' },
    { value: 'LSEBC', label: 'LSEBC' },
    { value: 'GNTA', label: 'GNTA' },
    { value: 'LSC', label: 'LSC' },
  ];

  const branches = [
    'Civil Engineering',
    'Computer Science and Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Electronics and Telecommunication Engg',
    'Instrumentation Engineering',
    'Mechanical Engineering'
  ];

  const collegeTypeOptions: CollegeType[] = [
    { value: 'Government', label: 'Government' },
    { value: 'Government Autonomous', label: 'Government Autonomous' },
    { value: 'Private', label: 'Private' },
  ];

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    const collegeTypes = await fetchAvailableCollegeTypes();
    setAvailableCollegeTypes(collegeTypes);
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
    if (!formData.fullName || !formData.aggregate || !formData.category || formData.preferredBranches.length === 0) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields and select at least one branch.",
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
      
      for (const branch of formData.preferredBranches) {
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
            <Card className="mb-6">
              <CardHeader className="text-center">
                <CardTitle>Welcome to DSE College Finder</CardTitle>
                <CardDescription>
                  Choose how you'd like to proceed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleGuestAccess}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <User className="h-6 w-6" />
                    <span className="font-medium">Continue as Guest</span>
                    <span className="text-xs text-gray-500">Quick search without saving</span>
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/admin-auth'}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Users className="h-6 w-6" />
                    <span className="font-medium">Login with Email</span>
                    <span className="text-xs text-gray-200">Save searches & get full features</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(isGuest || currentStep > 1) && (
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">
                  {currentStep === 1 && "Personal Information"}
                  {currentStep === 2 && "Academic Details"}
                  {currentStep === 3 && "Branch & College Preferences"}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "Tell us about yourself for personalized college recommendations."}
                  {currentStep === 2 && "Enter your percentage and category."}
                  {currentStep === 3 && "Select your preferred branches and college types."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(currentStep === 1 && isGuest) && (
                  <div className="space-y-2">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-2">
                    <div className="grid gap-2">
                      <Label htmlFor="aggregate">Aggregate Percentage</Label>
                      <Input
                        id="aggregate"
                        type="number"
                        step="0.01"
                        placeholder="Enter your percentage (e.g., 82.02)"
                        value={formData.aggregate}
                        onChange={(e) => setFormData({ ...formData, aggregate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="" disabled>Select your category</option>
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Preferred Branches (Select multiple)</Label>
                      <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                        {branches.map((branch) => (
                          <div key={branch} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={branch}
                              checked={formData.preferredBranches.includes(branch)}
                              onChange={(e) => handleBranchChange(branch, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={branch} className="text-sm font-normal">
                              {branch}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.preferredBranches.length === 0 && (
                        <p className="text-sm text-red-500">Please select at least one branch</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>College Types (Select all that apply)</Label>
                      <div className="grid grid-cols-1 gap-3">
                        {collegeTypeOptions.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={type.value}
                              checked={formData.collegeTypes.includes(type.value)}
                              onChange={(e) => handleCollegeTypeChange(type.value, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={type.value} className="text-sm font-normal">
                              {type.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {formData.collegeTypes.length === 0 && (
                        <p className="text-sm text-gray-500">No selection will include all college types</p>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      <strong>Note:</strong> Results will show unique college-branch-category combinations with 
                      separate columns for CAP1, CAP2, and CAP3 cutoffs from the database.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(isGuest || currentStep > 1) && (
            <div className="flex justify-between mt-4">
              {currentStep > 1 ? (
                <Button variant="secondary" onClick={handlePrev}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isAnalyzing}>
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;

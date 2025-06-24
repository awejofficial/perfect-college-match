
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, GraduationCap, MapPin, BookOpen, User, Percent, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollegeResultsTable } from "@/components/CollegeResultsTable";
import { Footer } from "@/components/Footer";
import { analyzeCollegeOptions, type CollegeMatch, type StudentProfile } from "@/services/deepseekService";
import { fetchCutoffData, fetchAvailableBranches, fetchAvailableCollegeTypes } from "@/services/databaseService";

interface Category {
  value: string;
  label: string;
}

interface Branch {
  value: string;
  label: string;
}

interface CollegeType {
  value: string;
  label: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CollegeMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableCollegeTypes, setAvailableCollegeTypes] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    aggregate: '',
    category: '',
    preferredBranch: '',
    collegeTypes: [] as string[]
  });

  const categories: Category[] = [
    { value: 'GOPEN', label: 'GOPEN (General Open)' },
    { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
    { value: 'SC', label: 'SC (Scheduled Caste)' },
    { value: 'ST', label: 'ST (Scheduled Tribe)' },
    { value: 'OBC', label: 'OBC (Other Backward Class)' },
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
    const [branches, collegeTypes] = await Promise.all([
      fetchAvailableBranches(),
      fetchAvailableCollegeTypes()
    ]);
    
    setAvailableBranches(branches);
    setAvailableCollegeTypes(collegeTypes);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.aggregate || !formData.category || !formData.preferredBranch) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
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
      // Fetch real cutoff data from database
      const cutoffData = await fetchCutoffData(
        formData.category,
        formData.preferredBranch,
        formData.collegeTypes.length > 0 ? formData.collegeTypes : undefined
      );

      if (cutoffData.length === 0) {
        toast({
          title: "No Data Available",
          description: "No cutoff data found for your selected criteria. Please try different options or contact admin to upload data.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      const studentProfile: StudentProfile = {
        fullName: formData.fullName,
        aggregate: aggregate,
        category: formData.category,
        preferredBranch: formData.preferredBranch,
        preferredCities: [],
        collegeTypes: formData.collegeTypes
      };

      console.log('Analyzing DSE college options for:', studentProfile);
      console.log('Using cutoff data:', cutoffData.length, 'records');
      
      // Convert database format to service format
      const formattedCutoffData = cutoffData.map(record => ({
        collegeName: record.college_name,
        branchName: record.branch_name,
        category: record.category,
        cutoffValue: record.cutoff_value,
        city: record.city || 'Unknown',
        collegeType: record.college_type,
        year: record.year || 2024
      }));

      const collegeMatches = await analyzeCollegeOptions(studentProfile, formattedCutoffData);
      
      console.log('DSE Analysis Results:', collegeMatches);
      
      setResults(collegeMatches);
      setShowResults(true);
      
      const eligibleCount = collegeMatches.filter(college => college.eligible).length;
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${collegeMatches.length} colleges (${eligibleCount} eligible) for ${formData.fullName}.`
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
                  {currentStep === 3 && "Select your preferred branch and college types."}
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
                      <Label htmlFor="preferredBranch">Preferred Branch</Label>
                      <select
                        id="preferredBranch"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.preferredBranch}
                        onChange={(e) => setFormData({ ...formData, preferredBranch: e.target.value })}
                      >
                        <option value="" disabled>Select your preferred branch</option>
                        {availableBranches.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
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
                      <strong>Note:</strong> Results are based on real cutoff data uploaded by admins. 
                      Data availability depends on what has been uploaded to the system.
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

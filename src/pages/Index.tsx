import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, GraduationCap, MapPin, BookOpen, User, Percent, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CollegeResultsTable } from "@/components/CollegeResultsTable";
import { analyzeCollegeOptions, type CollegeMatch, type StudentProfile } from "@/services/deepseekService";

interface City {
  value: string;
  label: string;
}

interface Category {
  value: string;
  label: string;
}

interface Branch {
  value: string;
  label: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CollegeMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    aggregate: '',
    category: '',
    preferredBranch: '',
    preferredCities: [] as string[]
  });

  const categories: Category[] = [
    { value: 'EWS', label: 'EWS (Economically Weaker Section)' },
    { value: 'GOPEN', label: 'GOPEN (General Open)' },
  ];

  const branches: Branch[] = [
    { value: 'Computer Engineering', label: 'Computer Engineering' },
    { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
    { value: 'Computer Science and Engineering (Data Science)', label: 'Computer Science and Engineering (Data Science)' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Artificial Intelligence and Data Science', label: 'Artificial Intelligence and Data Science' },
    { value: 'Artificial Intelligence (AI) and Data Science', label: 'Artificial Intelligence (AI) and Data Science' },
  ];

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

    // Validate category
    if (!['EWS', 'GOPEN'].includes(formData.category)) {
      toast({
        title: "Invalid Category",
        description: "Only EWS and GOPEN categories are supported for DSE.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const studentProfile: StudentProfile = {
        fullName: formData.fullName,
        aggregate: aggregate,
        category: formData.category,
        preferredBranch: formData.preferredBranch,
        preferredCities: [] // Show all cities
      };

      console.log('Analyzing DSE college options for:', studentProfile);
      
      const collegeMatches = await analyzeCollegeOptions(studentProfile);
      
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

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              DSE College Finder 2024
            </h1>
            <p className="text-gray-600">Find eligible CS/IT/AI colleges for {formData.fullName}</p>
          </div>

          <CollegeResultsTable 
            results={results} 
            studentName={formData.fullName}
            onRefillForm={refillForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            DSE College Finder 2024
          </h1>
          <p className="text-gray-600">Find eligible CS/IT/AI colleges in Maharashtra</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Academic Details"}
              {currentStep === 3 && "Branch Preference"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Tell us about yourself for personalized college recommendations."}
              {currentStep === 2 && "Enter your percentage and category (EWS/GOPEN only)."}
              {currentStep === 3 && "Select your preferred CS/IT/AI branch."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep === 1 && (
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
              <div className="space-y-2">
                <div className="grid gap-2">
                  <Label htmlFor="preferredBranch">Preferred Branch</Label>
                  <select
                    id="preferredBranch"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.preferredBranch}
                    onChange={(e) => setFormData({ ...formData, preferredBranch: e.target.value })}
                  >
                    <option value="" disabled>Select your preferred CS/IT/AI branch</option>
                    {branches.map((branch) => (
                      <option key={branch.value} value={branch.value}>{branch.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <strong>Note:</strong> Results will show colleges from all cities in Maharashtra. 
                  Only EWS and GOPEN categories are supported for DSE admissions.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
                  Analyze Options
                  <GraduationCap className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;

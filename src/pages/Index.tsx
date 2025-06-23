
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, Download, FileText, GraduationCap } from "lucide-react";
import { CollegeResultsTable } from "@/components/CollegeResultsTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface StudentForm {
  fullName: string;
  aggregatePercentage: number;
  category: string;
  preferredBranch: string;
  preferredCities: string[];
}

interface CollegeResult {
  collegeName: string;
  city: string;
  branch: string;
  category: string;
  cutoffRound1: number;
  cutoffRound2: number;
  cutoffRound3: number;
}

const Index = () => {
  const [formData, setFormData] = useState<StudentForm>({
    fullName: '',
    aggregatePercentage: 0,
    category: '',
    preferredBranch: '',
    preferredCities: []
  });
  
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const categories = ['GOPEN', 'EWS', 'SC', 'ST', 'OBC', 'VJ', 'NT-A', 'NT-B', 'NT-C', 'NT-D', 'SBC'];
  const branches = ['Computer Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Electronics & Telecommunication', 'Information Technology', 'Chemical Engineering', 'Automobile Engineering'];
  const cities = ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad', 'Kolhapur', 'Solapur', 'Sangli', 'Satara', 'Ahmednagar'];

  const handleCityToggle = (city: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCities: prev.preferredCities.includes(city)
        ? prev.preferredCities.filter(c => c !== city)
        : [...prev.preferredCities, city]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.aggregatePercentage || !formData.category || !formData.preferredBranch) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock API call to DeepSeek R1 (would be replaced with actual API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock results for demonstration
      const mockResults: CollegeResult[] = [
        {
          collegeName: "Government College of Engineering, Pune",
          city: "Pune",
          branch: formData.preferredBranch,
          category: formData.category,
          cutoffRound1: 85.5,
          cutoffRound2: 83.2,
          cutoffRound3: 81.0
        },
        {
          collegeName: "Walchand College of Engineering, Sangli",
          city: "Sangli",
          branch: formData.preferredBranch,
          category: formData.category,
          cutoffRound1: 82.3,
          cutoffRound2: 80.1,
          cutoffRound3: 78.5
        }
      ];
      
      setResults(mockResults);
      setShowResults(true);
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${mockResults.length} matching colleges for your profile.`
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefillForm = () => {
    setFormData({
      fullName: '',
      aggregatePercentage: 0,
      category: '',
      preferredBranch: '',
      preferredCities: []
    });
    setShowResults(false);
    setResults([]);
  };

  const exportToPDF = () => {
    toast({
      title: "Export Feature",
      description: "PDF export functionality will be implemented."
    });
  };

  const exportToCSV = () => {
    toast({
      title: "Export Feature", 
      description: "CSV export functionality will be implemented."
    });
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              MyDSE Options
            </h1>
            <p className="text-lg text-gray-600">Your Personalized College Recommendations</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Results for {formData.fullName}</span>
                <div className="flex gap-2">
                  <Button onClick={exportToPDF} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button onClick={exportToCSV} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={handleRefillForm} variant="default" size="sm">
                    Refill Form
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Category: {formData.category} | Branch: {formData.preferredBranch} | Aggregate: {formData.aggregatePercentage}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CollegeResultsTable results={results} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            MyDSE Options
          </h1>
          <p className="text-lg text-gray-600">Find Your Perfect DSE College Match in Maharashtra</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information Form</CardTitle>
            <CardDescription>
              Fill in your details to get personalized college recommendations for Direct Second Year Engineering admission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Final Year Diploma Aggregate Percentage *</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.aggregatePercentage || ''}
                  onChange={(e) => setFormData(prev => ({...prev, aggregatePercentage: parseFloat(e.target.value) || 0}))}
                  placeholder="Enter your aggregate percentage"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Engineering Branch *</Label>
                <Select value={formData.preferredBranch} onValueChange={(value) => setFormData(prev => ({...prev, preferredBranch: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your preferred branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Preferred Cities (optional - leave empty for all cities)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {cities.map(city => (
                    <div key={city} className="flex items-center space-x-2">
                      <Checkbox
                        id={city}
                        checked={formData.preferredCities.includes(city)}
                        onCheckedChange={() => handleCityToggle(city)}
                      />
                      <Label htmlFor={city} className="text-sm font-normal">{city}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Analyzing Your Profile...
                  </>
                ) : (
                  'Find My College Options'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;

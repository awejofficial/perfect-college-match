
import React from 'react';
import { GraduationCap } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MinimalResultsTable } from "@/components/MinimalResultsTable";
import { Footer } from "@/components/Footer";

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

interface FormData {
  fullName: string;
  aggregate: string;
  category: string;
  preferredBranches: string[];
  selectedColleges: string[];
}

interface ResultsViewProps {
  results: CollegeMatch[];
  formData: FormData;
  onRefillForm: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  results, 
  formData, 
  onRefillForm 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <Card className="mb-6 bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-4xl mb-2 flex items-center justify-center gap-3">
                  <GraduationCap className="h-10 w-10" />
                  DSE College Finder 2024
                </CardTitle>
                <CardDescription className="text-violet-100 text-lg">
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
            onRefillForm={onRefillForm}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
};

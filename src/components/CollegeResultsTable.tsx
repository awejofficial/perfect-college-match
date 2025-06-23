
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Check, X } from "lucide-react";
import { CollegeMatch } from "@/services/deepseekService";

interface CollegeResultsTableProps {
  results: CollegeMatch[];
  studentName: string;
  onRefillForm: () => void;
}

export const CollegeResultsTable: React.FC<CollegeResultsTableProps> = ({ 
  results, 
  studentName, 
  onRefillForm 
}) => {
  const exportToCSV = () => {
    const headers = ['College Name', 'City', 'Branch', 'Category', 'Round', 'Cutoff (%)', 'Eligible'];
    const csvContent = [
      headers.join(','),
      ...results.map(college => [
        `"${college.collegeName}"`,
        college.city,
        `"${college.branch}"`,
        college.category,
        college.round,
        college.cutoff,
        college.eligible ? 'YES' : 'NO'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${studentName}-dse-colleges-2024.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const eligibleCount = results.filter(college => college.eligible).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">DSE College Options (2024)</h2>
          <p className="text-gray-600">
            {results.length > 0 
              ? `Found ${results.length} colleges (${eligibleCount} eligible)`
              : "No colleges found matching your criteria"
            }
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onRefillForm}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Search
          </Button>
          {results.length > 0 && (
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {results.length > 0 
              ? `DSE college eligibility for ${studentName} based on 2024 CAP Round cutoffs`
              : "Try adjusting your category to EWS/GOPEN and select CS/IT/AI branches"
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">College Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Round</TableHead>
              <TableHead className="text-center">Cutoff (%)</TableHead>
              <TableHead className="text-center">Eligible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((college, index) => (
              <TableRow key={index} className={college.eligible ? 'bg-green-50' : 'bg-red-50'}>
                <TableCell className="font-medium">{college.collegeName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{college.city}</Badge>
                </TableCell>
                <TableCell className="text-sm">{college.branch}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{college.category}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">Round {college.round}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono">{college.cutoff}%</TableCell>
                <TableCell className="text-center">
                  {college.eligible ? (
                    <div className="flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="ml-1 text-green-600 font-medium">Eligible</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <X className="w-5 h-5 text-red-600" />
                      <span className="ml-1 text-red-600 font-medium">Not Eligible</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {eligibleCount > 0 && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Eligible Colleges Found!</h3>
          <p className="text-green-700">
            You are eligible for {eligibleCount} out of {results.length} colleges. 
            Focus on the eligible ones and consider them for your DSE application.
          </p>
        </div>
      )}
    </div>
  );
};


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
import { RefreshCw, Download } from "lucide-react";
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
    const headers = ['College Name', 'City', 'Branch', 'Category', 'Round I Cutoff', 'Round II Cutoff', 'Round III Cutoff'];
    const csvContent = [
      headers.join(','),
      ...results.map(college => [
        `"${college.collegeName}"`,
        college.city,
        `"${college.branch}"`,
        college.category,
        college.roundICutoff,
        college.roundIICutoff,
        college.roundIIICutoff
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${studentName}-college-options.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your College Options</h2>
          <p className="text-gray-600">
            {results.length > 0 
              ? `Found ${results.length} matching colleges`
              : "No colleges found matching your criteria"
            }
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onRefillForm}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refill Form
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
              ? `College options for ${studentName} based on your profile`
              : "Try adjusting your preferences and refill the form"
            }
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">College Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Round I</TableHead>
              <TableHead className="text-center">Round II</TableHead>
              <TableHead className="text-center">Round III</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((college, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{college.collegeName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{college.city}</Badge>
                </TableCell>
                <TableCell className="text-sm">{college.branch}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{college.category}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono">{college.roundICutoff}%</TableCell>
                <TableCell className="text-center font-mono">{college.roundIICutoff}%</TableCell>
                <TableCell className="text-center font-mono">{college.roundIIICutoff}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};


import React from 'react';
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

interface CollegeResult {
  collegeName: string;
  city: string;
  branch: string;
  category: string;
  cutoffRound1: number;
  cutoffRound2: number;
  cutoffRound3: number;
}

interface CollegeResultsTableProps {
  results: CollegeResult[];
}

export const CollegeResultsTable: React.FC<CollegeResultsTableProps> = ({ results }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>
          {results.length > 0 
            ? `Found ${results.length} matching colleges based on your criteria`
            : "No colleges found matching your criteria"
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
              <TableCell className="text-center font-mono">{college.cutoffRound1}%</TableCell>
              <TableCell className="text-center font-mono">{college.cutoffRound2}%</TableCell>
              <TableCell className="text-center font-mono">{college.cutoffRound3}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

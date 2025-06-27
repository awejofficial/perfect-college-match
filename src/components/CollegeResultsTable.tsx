import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Check, X, Filter, SortAsc, Search } from "lucide-react";
import { PaginationControls } from "@/components/PaginationControls";

export interface CollegeMatch {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'cutoff' | 'eligible'>('eligible');
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'government' | 'private'>('all');
  const resultsPerPage = 12;

  // Reset to first page when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

  // Filter and sort results
  const filteredResults = results
    .filter(college => {
      switch (filterType) {
        case 'eligible':
          return college.eligible;
        case 'government':
          return college.collegeType?.toLowerCase().includes('government');
        case 'private':
          return college.collegeType?.toLowerCase().includes('private');
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.collegeName.localeCompare(b.collegeName);
        case 'cutoff':
          const getCutoff = (college: CollegeMatch) => {
            const cutoffs = [college.cap1Cutoff, college.cap2Cutoff, college.cap3Cutoff]
              .filter(c => c !== null) as number[];
            return cutoffs.length > 0 ? Math.min(...cutoffs) : 100;
          };
          return getCutoff(a) - getCutoff(b);
        case 'eligible':
        default:
          if (a.eligible && !b.eligible) return -1;
          if (!a.eligible && b.eligible) return 1;
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const headers = ['College Name', 'City', 'Branch', 'Category', 'Type', 'CAP1', 'CAP2', 'CAP3', 'Eligible'];
    const csvContent = [
      headers.join(','),
      ...filteredResults.map(college => [
        `"${college.collegeName}"`,
        college.city,
        `"${college.branch}"`,
        college.category,
        college.collegeType || 'N/A',
        college.cap1Cutoff || 'N/A',
        college.cap2Cutoff || 'N/A',
        college.cap3Cutoff || 'N/A',
        college.eligible ? 'YES' : 'NO'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${studentName}-colleges-2024.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eligibleCount = results.filter(college => college.eligible).length;

  return (
    <div className="container-nvidia py-8 animate-fade-in">
      {/* Header Section */}
      <div className="card-professional mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              College Results for {studentName}
            </h1>
            <p className="text-muted-foreground">
              {filteredResults.length > 0 
                ? `Showing ${filteredResults.length} colleges (${eligibleCount} eligible)`
                : "No colleges found matching your criteria"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onRefillForm} className="btn-secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              New Search
            </Button>
            {results.length > 0 && (
              <Button onClick={exportToCSV} className="btn-nvidia">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      {results.length > 0 && (
        <div className="card-professional mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter:</span>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
                className="input-nvidia text-sm"
              >
                <option value="all">All Colleges</option>
                <option value="eligible">Eligible Only</option>
                <option value="government">Government</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-nvidia text-sm"
              >
                <option value="eligible">Eligibility</option>
                <option value="name">College Name</option>
                <option value="cutoff">Cutoff</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {currentResults.length > 0 ? (
        <>
          <div className="grid-nvidia animate-slide-up">
            {currentResults.map((college, index) => (
              <div 
                key={`${college.collegeName}-${college.branch}-${college.category}-${index}`} 
                className={`card-professional ${
                  college.eligible 
                    ? 'border-nvidia-green/30 bg-nvidia-green/5' 
                    : 'border-border'
                } animate-scale-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* College Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                      {college.collegeName}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {college.city}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {college.collegeType || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    {college.eligible ? (
                      <div className="flex items-center text-nvidia-green">
                        <Check className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="flex items-center text-destructive">
                        <X className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Branch and Category */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-1">{college.branch}</p>
                  <Badge variant="outline" className="text-xs">
                    {college.category}
                  </Badge>
                </div>

                {/* Cutoff Information */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: 'CAP1', value: college.cap1Cutoff },
                    { label: 'CAP2', value: college.cap2Cutoff },
                    { label: 'CAP3', value: college.cap3Cutoff }
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-xs text-muted-foreground">{label}</div>
                      <div className="font-semibold text-foreground">
                        {value ? `${value}%` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className={`text-sm font-medium ${
                      college.eligible ? 'text-nvidia-green' : 'text-destructive'
                    }`}>
                      {college.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalResults={filteredResults.length}
              resultsPerPage={resultsPerPage}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="card-professional max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              No colleges match your current criteria. Try adjusting your filters or search parameters.
            </p>
            <Button onClick={onRefillForm} className="btn-nvidia">
              Start New Search
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {eligibleCount > 0 && (
        <div className="card-professional mt-8 border-nvidia-green/30 bg-nvidia-green/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nvidia-green/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-nvidia-green" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Great News!</h3>
              <p className="text-muted-foreground">
                You're eligible for {eligibleCount} out of {results.length} colleges. 
                Focus on these options for your applications.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

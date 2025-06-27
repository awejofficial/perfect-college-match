
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Check, X, Filter, Search } from "lucide-react";
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

interface MinimalResultsTableProps {
  results: CollegeMatch[];
  studentName: string;
  onRefillForm: () => void;
}

export const MinimalResultsTable: React.FC<MinimalResultsTableProps> = ({ 
  results, 
  studentName, 
  onRefillForm 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'government' | 'private'>('all');
  const [cityFilter, setCityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const resultsPerPage = 15;

  // Get unique cities for filter
  const uniqueCities = [...new Set(results.map(college => college.city))].sort();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [results, filterType, cityFilter, searchTerm]);

  // Filter and search results
  const filteredResults = results
    .filter(college => {
      // Type filter
      let typeMatch = true;
      switch (filterType) {
        case 'eligible':
          typeMatch = college.eligible;
          break;
        case 'government':
          typeMatch = college.collegeType?.toLowerCase().includes('government');
          break;
        case 'private':
          typeMatch = college.collegeType?.toLowerCase().includes('private');
          break;
      }

      // City filter
      const cityMatch = cityFilter === '' || college.city === cityFilter;

      // Search filter
      const searchMatch = searchTerm === '' || 
        college.collegeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.branch.toLowerCase().includes(searchTerm.toLowerCase());

      return typeMatch && cityMatch && searchMatch;
    })
    .sort((a, b) => {
      // Sort eligible first, then by lowest cutoff
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      
      const getCutoff = (college: CollegeMatch) => {
        const cutoffs = [college.cap1Cutoff, college.cap2Cutoff, college.cap3Cutoff]
          .filter(c => c !== null) as number[];
        return cutoffs.length > 0 ? Math.min(...cutoffs) : 100;
      };
      
      return getCutoff(a) - getCutoff(b);
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
    <div className="container-minimal py-8">
      {/* Header */}
      <div className="minimal-card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              College Results for {studentName}
            </h1>
            <p className="text-muted-foreground">
              {filteredResults.length} colleges found ({eligibleCount} eligible)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onRefillForm} className="btn-minimal">
              <RefreshCw className="w-4 h-4 mr-2" />
              New Search
            </Button>
            {results.length > 0 && (
              <Button onClick={exportToCSV} className="btn-nvidia">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {results.length > 0 && (
        <div className="minimal-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search colleges or branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-minimal pl-10 w-full"
              />
            </div>

            {/* City Filter */}
            <select 
              value={cityFilter} 
              onChange={(e) => setCityFilter(e.target.value)}
              className="input-minimal"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            {/* Type Filter */}
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="input-minimal"
            >
              <option value="all">All Types</option>
              <option value="eligible">Eligible Only</option>
              <option value="government">Government</option>
              <option value="private">Private</option>
            </select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setCityFilter('');
                setFilterType('all');
                setSearchTerm('');
              }}
              className="btn-minimal"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Results Table */}
      {currentResults.length > 0 ? (
        <>
          <div className="minimal-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">College</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">City</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Branch</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">CAP1</th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">CAP2</th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">CAP3</th>
                  <th className="text-center py-3 px-4 font-medium text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((college, index) => (
                  <tr 
                    key={`${college.collegeName}-${college.branch}-${college.category}-${index}`}
                    className={`border-b border-border hover:bg-muted transition-minimal ${
                      college.eligible ? 'bg-nvidia-green/5' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-foreground text-sm mb-1">
                          {college.collegeName}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {college.category}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">{college.city}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{college.branch}</td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="text-xs">
                        {college.collegeType || 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      <span className={college.cap1Cutoff ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {college.cap1Cutoff ? `${college.cap1Cutoff}%` : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      <span className={college.cap2Cutoff ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {college.cap2Cutoff ? `${college.cap2Cutoff}%` : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      <span className={college.cap3Cutoff ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {college.cap3Cutoff ? `${college.cap3Cutoff}%` : '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {college.eligible ? (
                        <div className="flex items-center justify-center">
                          <Check className="w-5 h-5 text-nvidia-green" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalResults={filteredResults.length}
                resultsPerPage={resultsPerPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="minimal-card max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-4">
              No colleges match your current criteria. Try adjusting your filters.
            </p>
            <Button onClick={onRefillForm} className="btn-nvidia">
              Start New Search
            </Button>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {eligibleCount > 0 && (
        <div className="minimal-card mt-6 border-nvidia-green/30 bg-nvidia-green/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-nvidia-green/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-nvidia-green" />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Eligible Colleges Found</h3>
              <p className="text-muted-foreground text-sm">
                You're eligible for {eligibleCount} out of {results.length} colleges. Focus on these options.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

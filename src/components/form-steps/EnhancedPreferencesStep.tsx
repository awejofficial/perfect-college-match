
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Minus, Plus } from "lucide-react";
import {
  fetchAllCollegeNames,
  fetchCollegeTypesForColleges,
  fetchBranchesForColleges,
  fetchAvailableCategories,
  type CollegeTypeInfo,
  type CollegeBranchInfo
} from "@/services/databaseService";

interface CollegeSelection {
  collegeName: string;
  collegeType: string;
  selectedBranches: string[];
  availableBranches: string[];
  expanded: boolean;
}

interface EnhancedPreferencesStepProps {
  preferredBranches: string[];
  collegeTypes: string[];
  selectedColleges: string[];
  collegeSelections: CollegeSelection[];
  category: string;
  onBranchChange: (branch: string, checked: boolean) => void;
  onCollegeTypeChange: (collegeType: string, checked: boolean) => void;
  onCollegeSelectionChange: (colleges: string[]) => void;
  onCollegeSelectionsChange: (selections: CollegeSelection[]) => void;
  onCategoryChange: (category: string) => void;
}

export const EnhancedPreferencesStep: React.FC<EnhancedPreferencesStepProps> = ({
  preferredBranches,
  collegeTypes,
  selectedColleges,
  collegeSelections,
  category,
  onBranchChange,
  onCollegeTypeChange,
  onCollegeSelectionChange,
  onCollegeSelectionsChange,
  onCategoryChange
}) => {
  const [availableColleges, setAvailableColleges] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedColleges.length > 0) {
      loadCollegeData();
    }
  }, [selectedColleges]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [colleges, categories] = await Promise.all([
        fetchAllCollegeNames(),
        fetchAvailableCategories()
      ]);
      
      setAvailableColleges(colleges);
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollegeData = async () => {
    if (selectedColleges.length === 0) return;

    setIsLoading(true);
    try {
      const [collegeTypeData, branchData] = await Promise.all([
        fetchCollegeTypesForColleges(selectedColleges),
        fetchBranchesForColleges(selectedColleges)
      ]);

      const newSelections: CollegeSelection[] = selectedColleges.map(collegeName => {
        const existingSelection = collegeSelections.find(s => s.collegeName === collegeName);
        const typeInfo = collegeTypeData.find(ct => ct.college_name === collegeName);
        const branches = branchData
          .filter(b => b.college_name === collegeName)
          .map(b => b.branch_name);

        return {
          collegeName,
          collegeType: typeInfo?.college_type || 'No data found',
          selectedBranches: existingSelection?.selectedBranches || [],
          availableBranches: branches,
          expanded: existingSelection?.expanded ?? false
        };
      });

      onCollegeSelectionsChange(newSelections);
    } catch (error) {
      console.error('Failed to load college data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollegeToggle = (collegeName: string, checked: boolean) => {
    const newSelectedColleges = checked
      ? [...selectedColleges, collegeName]
      : selectedColleges.filter(c => c !== collegeName);
    
    onCollegeSelectionChange(newSelectedColleges);
  };

  const handleCollegeExpand = (collegeName: string) => {
    const updatedSelections = collegeSelections.map(selection =>
      selection.collegeName === collegeName
        ? { ...selection, expanded: !selection.expanded }
        : selection
    );
    onCollegeSelectionsChange(updatedSelections);
  };

  const handleBranchToggle = (collegeName: string, branchName: string, checked: boolean) => {
    const updatedSelections = collegeSelections.map(selection => {
      if (selection.collegeName === collegeName) {
        const newSelectedBranches = checked
          ? [...selection.selectedBranches, branchName]
          : selection.selectedBranches.filter(b => b !== branchName);
        
        return { ...selection, selectedBranches: newSelectedBranches };
      }
      return selection;
    });
    
    onCollegeSelectionsChange(updatedSelections);
    
    // Update global branch selection
    onBranchChange(branchName, checked);
  };

  const getTotalSelectedBranches = () => {
    return collegeSelections.reduce((total, selection) => total + selection.selectedBranches.length, 0);
  };

  const getCollegeTypeOptions = () => {
    const types = [...new Set(collegeSelections.map(s => s.collegeType).filter(t => t !== 'No data found'))];
    return types.map(type => ({ value: type, label: type }));
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Enhanced College & Branch Selection</CardTitle>
        <CardDescription>
          Select colleges, categories, and branches with dynamic loading and folder-like structure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Category Selection</Label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select category</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {!category && (
            <p className="text-sm text-red-500">Please select a category first</p>
          )}
        </div>

        {/* College Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">College Selection</Label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
            {availableColleges.map((college) => (
              <div key={college} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`college-${college}`}
                  checked={selectedColleges.includes(college)}
                  onChange={(e) => handleCollegeToggle(college, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`college-${college}`} className="text-sm font-normal">
                  {college}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedColleges.map((college) => (
              <Badge key={college} variant="secondary" className="text-xs">
                {college}
              </Badge>
            ))}
          </div>
        </div>

        {/* Folder-like College-Branch Structure */}
        {collegeSelections.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              College-Branch Structure ({getTotalSelectedBranches()} branches selected)
            </Label>
            <div className="border rounded-md p-3 space-y-2 max-h-80 overflow-y-auto">
              {collegeSelections.map((selection) => (
                <div key={selection.collegeName} className="space-y-2">
                  <div 
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => handleCollegeExpand(selection.collegeName)}
                  >
                    {selection.expanded ? (
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Folder className="h-4 w-4 text-gray-600" />
                    )}
                    {selection.expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{selection.collegeName}</div>
                      <div className="text-xs text-gray-500 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          Type: {selection.collegeType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selection.selectedBranches.length}/{selection.availableBranches.length} branches
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selection.expanded && (
                    <div className="ml-8 space-y-1">
                      {selection.availableBranches.length > 0 ? (
                        selection.availableBranches.map((branch) => (
                          <div key={branch} className="flex items-center space-x-2 py-1">
                            <input
                              type="checkbox"
                              id={`branch-${selection.collegeName}-${branch}`}
                              checked={selection.selectedBranches.includes(branch)}
                              onChange={(e) => handleBranchToggle(selection.collegeName, branch, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label 
                              htmlFor={`branch-${selection.collegeName}-${branch}`} 
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              ├── {branch}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 italic ml-4">
                          No branches available for this college
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* College Type Filter */}
        {collegeSelections.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Filter by College Type (Optional)</Label>
            <div className="grid grid-cols-1 gap-2">
              {getCollegeTypeOptions().map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`type-${type.value}`}
                    checked={collegeTypes.includes(type.value)}
                    onChange={(e) => onCollegeTypeChange(type.value, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm font-normal">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
            {collegeTypes.length === 0 && (
              <p className="text-sm text-gray-500">No selection will include all college types</p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading college data...</p>
          </div>
        )}

        {/* Summary */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Selection Summary:</strong>
          <ul className="mt-2 space-y-1">
            <li>• Category: {category || 'Not selected'}</li>
            <li>• Colleges: {selectedColleges.length} selected</li>
            <li>• Branches: {getTotalSelectedBranches()} selected across all colleges</li>
            <li>• College Types: {collegeTypes.length > 0 ? collegeTypes.join(', ') : 'All types included'}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

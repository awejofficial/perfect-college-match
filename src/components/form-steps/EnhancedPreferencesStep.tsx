
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
    } else {
      // Clear college selections when no colleges are selected
      onCollegeSelectionsChange([]);
    }
  }, [selectedColleges]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading initial data...');
      const [colleges, categories] = await Promise.all([
        fetchAllCollegeNames(),
        fetchAvailableCategories()
      ]);
      
      console.log('Loaded colleges:', colleges.length);
      console.log('Loaded categories:', categories.length);
      
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
      console.log('Loading college data for:', selectedColleges);
      const [collegeTypeData, branchData] = await Promise.all([
        fetchCollegeTypesForColleges(selectedColleges),
        fetchBranchesForColleges(selectedColleges)
      ]);

      console.log('College type data:', collegeTypeData);
      console.log('Branch data:', branchData);

      const newSelections: CollegeSelection[] = selectedColleges.map(collegeName => {
        const existingSelection = collegeSelections.find(s => s.collegeName === collegeName);
        const typeInfo = collegeTypeData.find(ct => ct.college_name === collegeName);
        const branches = branchData
          .filter(b => b.college_name === collegeName)
          .map(b => b.branch_name);

        return {
          collegeName,
          collegeType: typeInfo?.college_type || 'Unknown',
          selectedBranches: existingSelection?.selectedBranches || [],
          availableBranches: branches,
          expanded: existingSelection?.expanded ?? false
        };
      });

      console.log('New selections:', newSelections);
      onCollegeSelectionsChange(newSelections);
    } catch (error) {
      console.error('Failed to load college data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollegeToggle = (collegeName: string, checked: boolean) => {
    console.log('Toggling college:', collegeName, checked);
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
    console.log('Toggling branch:', collegeName, branchName, checked);
    
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
  };

  const getTotalSelectedBranches = () => {
    return collegeSelections.reduce((total, selection) => total + selection.selectedBranches.length, 0);
  };

  const getCollegeTypeOptions = () => {
    const types = [...new Set(collegeSelections.map(s => s.collegeType).filter(t => t !== 'Unknown'))];
    return types.map(type => ({ value: type, label: type }));
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">College & Branch Selection</CardTitle>
        <CardDescription>
          Select your category, colleges, and specific branches you want to apply for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-red-600">* Category Selection (Required)</Label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select your category</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {!category && (
            <p className="text-sm text-red-500">⚠️ Please select your category first</p>
          )}
        </div>

        {/* College Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-red-600">* College Selection (Required)</Label>
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading colleges...</p>
              </div>
            ) : availableColleges.length > 0 ? (
              availableColleges.map((college) => (
                <div key={college} className="flex items-center space-x-2 hover:bg-white p-2 rounded">
                  <input
                    type="checkbox"
                    id={`college-${college}`}
                    checked={selectedColleges.includes(college)}
                    onChange={(e) => handleCollegeToggle(college, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`college-${college}`} className="text-sm font-normal cursor-pointer flex-1">
                    {college}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No colleges available. Please check your database.</p>
            )}
          </div>
          
          {selectedColleges.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {selectedColleges.map((college) => (
                <Badge key={college} variant="secondary" className="text-xs">
                  {college}
                </Badge>
              ))}
            </div>
          )}
          
          {selectedColleges.length === 0 && (
            <p className="text-sm text-red-500">⚠️ Please select at least one college</p>
          )}
        </div>

        {/* College-Branch Structure */}
        {collegeSelections.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold text-red-600">
              * Branch Selection ({getTotalSelectedBranches()} branches selected)
            </Label>
            <div className="border rounded-md p-3 space-y-2 max-h-80 overflow-y-auto bg-gray-50">
              {collegeSelections.map((selection) => (
                <div key={selection.collegeName} className="space-y-2 bg-white rounded-lg p-2">
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
                      <div className="font-medium text-sm">{selection.collegeName}</div>
                      <div className="text-xs text-gray-500 flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {selection.collegeType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {selection.selectedBranches.length}/{selection.availableBranches.length} branches
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {selection.expanded && (
                    <div className="ml-8 space-y-1 max-h-40 overflow-y-auto">
                      {selection.availableBranches.length > 0 ? (
                        selection.availableBranches.map((branch) => (
                          <div key={branch} className="flex items-center space-x-2 py-1 hover:bg-gray-100 px-2 rounded">
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
            
            {getTotalSelectedBranches() === 0 && (
              <p className="text-sm text-red-500">⚠️ Please select at least one branch from the colleges above</p>
            )}
          </div>
        )}

        {/* College Type Filter */}
        {collegeSelections.length > 0 && getCollegeTypeOptions().length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">College Type Filter (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
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
            <p className="text-sm text-gray-500">Leave empty to include all college types</p>
          </div>
        )}

        {/* Selection Summary */}
        <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <strong className="text-blue-800">Selection Summary:</strong>
          <ul className="mt-2 space-y-1">
            <li>• <strong>Category:</strong> {category || 'Not selected'}</li>
            <li>• <strong>Colleges:</strong> {selectedColleges.length} selected</li>
            <li>• <strong>Branches:</strong> {getTotalSelectedBranches()} selected across all colleges</li>
            <li>• <strong>College Types Filter:</strong> {collegeTypes.length > 0 ? collegeTypes.join(', ') : 'All types included'}</li>
          </ul>
          
          {(!category || selectedColleges.length === 0 || getTotalSelectedBranches() === 0) && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700">
              <strong>⚠️ Required:</strong> Please complete category, college, and branch selections to proceed.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

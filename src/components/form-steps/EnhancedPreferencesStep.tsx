
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Minus, Plus, CheckCircle2 } from "lucide-react";
import {
  fetchAllCollegeNames,
  fetchCollegeTypesForColleges,
  fetchBranchesForColleges,
  fetchAvailableCategories,
  fetchAvailableBranches,
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
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useAllColleges, setUseAllColleges] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (useAllColleges || selectedColleges.length > 0) {
      const collegesToLoad = useAllColleges ? availableColleges : selectedColleges;
      if (collegesToLoad.length > 0) {
        loadCollegeData(collegesToLoad);
      }
    } else {
      onCollegeSelectionsChange([]);
    }
  }, [selectedColleges, useAllColleges, availableColleges]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading initial data...');
      const [colleges, categories, branches] = await Promise.all([
        fetchAllCollegeNames(),
        fetchAvailableCategories(),
        fetchAvailableBranches()
      ]);
      
      console.log('Loaded colleges:', colleges.length);
      console.log('Loaded categories:', categories.length);
      console.log('Loaded branches:', branches.length);
      
      setAvailableColleges(colleges);
      setAvailableCategories(categories);
      setAvailableBranches(branches);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollegeData = async (colleges: string[]) => {
    if (colleges.length === 0) return;

    setIsLoading(true);
    try {
      console.log('Loading college data for:', colleges);
      const [collegeTypeData, branchData] = await Promise.all([
        fetchCollegeTypesForColleges(colleges),
        fetchBranchesForColleges(colleges)
      ]);

      console.log('College type data:', collegeTypeData);
      console.log('Branch data:', branchData);

      const newSelections: CollegeSelection[] = colleges.map(collegeName => {
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

  const handleUseAllColleges = () => {
    setUseAllColleges(!useAllColleges);
    if (!useAllColleges) {
      // When switching to "all colleges", clear manual selection
      onCollegeSelectionChange([]);
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

  const handleBranchToggle = (branchName: string, checked: boolean) => {
    console.log('Toggling branch globally:', branchName, checked);
    onBranchChange(branchName, checked);
  };

  const handleCollegeBranchToggle = (collegeName: string, branchName: string, checked: boolean) => {
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
    return preferredBranches.length;
  };

  const getCollegeTypeOptions = () => {
    const types = [...new Set(collegeSelections.map(s => s.collegeType).filter(t => t !== 'Unknown'))];
    return types.map(type => ({ value: type, label: type }));
  };

  return (
    <Card className="glass-card rounded-2xl border-0 text-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-white">Course & College Selection</CardTitle>
        <CardDescription className="text-gray-200">
          Select your category and branches. College selection is optional - leave empty to include all colleges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-red-300">* Category Selection (Required)</Label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="glass-input w-full h-10 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="" className="bg-gray-800 text-white">Select your category</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-gray-800 text-white">{cat}</option>
            ))}
          </select>
          {!category && (
            <p className="text-sm text-red-300">⚠️ Please select your category first</p>
          )}
        </div>

        {/* Branch Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-red-300">
            * Branch Selection ({getTotalSelectedBranches()} branches selected)
          </Label>
          <div className="glass rounded-xl p-4 max-h-60 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableBranches.map((branch) => (
                <div key={branch} className="flex items-center space-x-3 glass-input rounded-lg p-3 hover:bg-white/20 transition-all duration-200">
                  <input
                    type="checkbox"
                    id={`branch-${branch}`}
                    checked={preferredBranches.includes(branch)}
                    onChange={(e) => handleBranchToggle(branch, e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
                  />
                  <Label htmlFor={`branch-${branch}`} className="text-sm font-normal text-white cursor-pointer flex-1">
                    {branch}
                  </Label>
                  {preferredBranches.includes(branch) && (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {preferredBranches.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {preferredBranches.map((branch) => (
                <Badge key={branch} variant="secondary" className="glass-button border-0 text-white">
                  {branch}
                </Badge>
              ))}
            </div>
          )}
          
          {preferredBranches.length === 0 && (
            <p className="text-sm text-red-300">⚠️ Please select at least one branch</p>
          )}
        </div>

        {/* College Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-white">College Selection (Optional)</Label>
          
          {/* Toggle for All Colleges */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="use-all-colleges"
                checked={useAllColleges}
                onChange={handleUseAllColleges}
                className="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
              />
              <Label htmlFor="use-all-colleges" className="text-sm font-medium text-white cursor-pointer">
                Include all available colleges (recommended)
              </Label>
            </div>
            
            {!useAllColleges && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Or select specific colleges:</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                      <p className="text-sm text-gray-300 mt-2">Loading colleges...</p>
                    </div>
                  ) : availableColleges.length > 0 ? (
                    availableColleges.map((college) => (
                      <div key={college} className="flex items-center space-x-2 glass-input rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                        <input
                          type="checkbox"
                          id={`college-${college}`}
                          checked={selectedColleges.includes(college)}
                          onChange={(e) => handleCollegeToggle(college, e.target.checked)}
                          className="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
                        />
                        <Label htmlFor={`college-${college}`} className="text-sm font-normal text-white cursor-pointer flex-1">
                          {college}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-300 text-center py-4">No colleges available. Please check your database.</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {selectedColleges.length > 0 && !useAllColleges && (
            <div className="flex gap-2 flex-wrap">
              {selectedColleges.map((college) => (
                <Badge key={college} variant="secondary" className="glass-button border-0 text-white">
                  {college}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* College Type Filter */}
        {collegeSelections.length > 0 && getCollegeTypeOptions().length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold text-white">College Type Filter (Optional)</Label>
            <div className="glass rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getCollegeTypeOptions().map((type) => (
                <div key={type.value} className="flex items-center space-x-3 glass-input rounded-lg p-3 hover:bg-white/20 transition-all duration-200">
                  <input
                    type="checkbox"
                    id={`type-${type.value}`}
                    checked={collegeTypes.includes(type.value)}
                    onChange={(e) => onCollegeTypeChange(type.value, e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
                  />
                  <Label htmlFor={`type-${type.value}`} className="text-sm font-normal text-white cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-300">Leave empty to include all college types</p>
          </div>
        )}

        {/* Selection Summary */}
        <div className="glass-strong rounded-xl p-4">
          <strong className="text-white">Selection Summary:</strong>
          <ul className="mt-2 space-y-1 text-gray-200">
            <li>• <strong>Category:</strong> {category || 'Not selected'}</li>
            <li>• <strong>Branches:</strong> {getTotalSelectedBranches()} selected</li>
            <li>• <strong>Colleges:</strong> {useAllColleges ? 'All colleges included' : `${selectedColleges.length} selected`}</li>
            <li>• <strong>College Types Filter:</strong> {collegeTypes.length > 0 ? collegeTypes.join(', ') : 'All types included'}</li>
          </ul>
          
          {(!category || getTotalSelectedBranches() === 0) && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-200">
              <strong>⚠️ Required:</strong> Please complete category and branch selections to proceed.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

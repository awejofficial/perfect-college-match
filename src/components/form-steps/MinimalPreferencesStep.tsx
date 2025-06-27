
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
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

interface MinimalPreferencesStepProps {
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

export const MinimalPreferencesStep: React.FC<MinimalPreferencesStepProps> = ({
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
  const [showBranches, setShowBranches] = useState(false);

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
      const [colleges, categories, branches] = await Promise.all([
        fetchAllCollegeNames(),
        fetchAvailableCategories(),
        fetchAvailableBranches()
      ]);
      
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
      const [collegeTypeData, branchData] = await Promise.all([
        fetchCollegeTypesForColleges(colleges),
        fetchBranchesForColleges(colleges)
      ]);

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
      onCollegeSelectionChange([]);
    }
  };

  const handleCollegeToggle = (collegeName: string, checked: boolean) => {
    const newSelectedColleges = checked
      ? [...selectedColleges, collegeName]
      : selectedColleges.filter(c => c !== collegeName);
    
    onCollegeSelectionChange(newSelectedColleges);
  };

  const handleBranchToggle = (branchName: string, checked: boolean) => {
    onBranchChange(branchName, checked);
  };

  const getTotalSelectedBranches = () => {
    return preferredBranches.length;
  };

  const getCollegeTypeOptions = () => {
    const types = [...new Set(collegeSelections.map(s => s.collegeType).filter(t => t !== 'Unknown'))];
    return types.map(type => ({ value: type, label: type }));
  };

  return (
    <Card className="minimal-card">
      <CardHeader>
        <CardTitle className="text-foreground">Course & College Selection</CardTitle>
        <CardDescription className="text-muted-foreground">
          Select your category and branches. College selection is optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Category *</Label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="input-minimal w-full"
          >
            <option value="">Select your category</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {!category && (
            <p className="text-sm text-destructive">Please select your category</p>
          )}
        </div>

        {/* Branch Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Branches * ({getTotalSelectedBranches()} selected)
            </Label>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowBranches(!showBranches)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showBranches ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          
          {showBranches && (
            <div className="minimal-card max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {availableBranches.map((branch) => (
                  <label key={branch} className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer transition-minimal">
                    <input
                      type="checkbox"
                      checked={preferredBranches.includes(branch)}
                      onChange={(e) => handleBranchToggle(branch, e.target.checked)}
                      className="w-4 h-4 accent-nvidia-green"
                    />
                    <span className="text-sm text-foreground flex-1">{branch}</span>
                    {preferredBranches.includes(branch) && (
                      <Check className="w-4 h-4 text-nvidia-green" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {preferredBranches.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {preferredBranches.slice(0, 3).map((branch) => (
                <Badge key={branch} variant="secondary" className="text-xs">
                  {branch}
                </Badge>
              ))}
              {preferredBranches.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{preferredBranches.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          {preferredBranches.length === 0 && (
            <p className="text-sm text-destructive">Please select at least one branch</p>
          )}
        </div>

        {/* College Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">College Selection (Optional)</Label>
          
          <div className="minimal-card">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={useAllColleges}
                onChange={handleUseAllColleges}
                className="w-4 h-4 accent-nvidia-green"
              />
              <span className="text-sm text-foreground">Include all available colleges (recommended)</span>
            </label>
            
            {!useAllColleges && (
              <div className="mt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Or select specific colleges:</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mx-auto"></div>
                      <p className="text-xs text-muted-foreground mt-2">Loading...</p>
                    </div>
                  ) : (
                    availableColleges.map((college) => (
                      <label key={college} className="flex items-center space-x-2 p-1 hover:bg-muted rounded cursor-pointer transition-minimal">
                        <input
                          type="checkbox"
                          checked={selectedColleges.includes(college)}
                          onChange={(e) => handleCollegeToggle(college, e.target.checked)}
                          className="w-3 h-3 accent-nvidia-green"
                        />
                        <span className="text-xs text-foreground">{college}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* College Type Filter */}
        {collegeSelections.length > 0 && getCollegeTypeOptions().length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">College Type Filter (Optional)</Label>
            <div className="minimal-card grid grid-cols-2 gap-3">
              {getCollegeTypeOptions().map((type) => (
                <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={collegeTypes.includes(type.value)}
                    onChange={(e) => onCollegeTypeChange(type.value, e.target.checked)}
                    className="w-4 h-4 accent-nvidia-green"
                  />
                  <span className="text-sm text-foreground">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Selection Summary */}
        <div className="minimal-card bg-muted">
          <div className="text-sm text-foreground">
            <strong>Summary:</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>Category: {category || 'Not selected'}</li>
              <li>Branches: {getTotalSelectedBranches()} selected</li>
              <li>Colleges: {useAllColleges ? 'All included' : `${selectedColleges.length} selected`}</li>
            </ul>
          </div>
          
          {(!category || getTotalSelectedBranches() === 0) && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              Please complete category and branch selections to proceed.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

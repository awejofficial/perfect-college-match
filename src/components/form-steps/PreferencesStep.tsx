
import React from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CollegeType {
  value: string;
  label: string;
}

interface PreferencesStepProps {
  preferredBranches: string[];
  collegeTypes: string[];
  availableBranches: string[];
  collegeTypeOptions: CollegeType[];
  onBranchChange: (branch: string, checked: boolean) => void;
  onCollegeTypeChange: (collegeType: string, checked: boolean) => void;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
  preferredBranches,
  collegeTypes,
  availableBranches,
  collegeTypeOptions,
  onBranchChange,
  onCollegeTypeChange
}) => {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Branch & College Preferences</CardTitle>
        <CardDescription>
          Select your preferred branches and college types.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Preferred Branches (Select multiple)</Label>
            <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
              {availableBranches.map((branch) => (
                <div key={branch} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={branch}
                    checked={preferredBranches.includes(branch)}
                    onChange={(e) => onBranchChange(branch, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={branch} className="text-sm font-normal">
                    {branch}
                  </Label>
                </div>
              ))}
            </div>
            {preferredBranches.length === 0 && (
              <p className="text-sm text-red-500">Please select at least one branch</p>
            )}
            {availableBranches.length === 0 && (
              <p className="text-sm text-yellow-600">No branches available. Please contact admin to upload cutoff data.</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label>College Types (Select all that apply)</Label>
            <div className="grid grid-cols-1 gap-3">
              {collegeTypeOptions.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={type.value}
                    checked={collegeTypes.includes(type.value)}
                    onChange={(e) => onCollegeTypeChange(type.value, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={type.value} className="text-sm font-normal">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
            {collegeTypes.length === 0 && (
              <p className="text-sm text-gray-500">No selection will include all college types</p>
            )}
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Note:</strong> Results will show unique college-branch-category combinations with 
            separate columns for CAP1, CAP2, and CAP3 cutoffs from the database.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

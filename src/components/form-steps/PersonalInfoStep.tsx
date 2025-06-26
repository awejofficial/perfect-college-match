
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalInfoStepProps {
  fullName: string;
  onFullNameChange: (value: string) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  fullName,
  onFullNameChange
}) => {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Personal Information</CardTitle>
        <CardDescription>
          Tell us about yourself for personalized college recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users } from "lucide-react";

interface WelcomeStepProps {
  onGuestAccess: () => void;
  onEmailLogin: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  onGuestAccess,
  onEmailLogin
}) => {
  return (
    <Card className="mb-6">
      <CardHeader className="text-center">
        <CardTitle>Welcome to DSE College Finder</CardTitle>
        <CardDescription>
          Choose how you'd like to proceed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={onGuestAccess}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <User className="h-6 w-6" />
            <span className="font-medium">Continue as Guest</span>
            <span className="text-xs text-gray-500">Quick search without saving</span>
          </Button>
          
          <Button 
            onClick={onEmailLogin}
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Users className="h-6 w-6" />
            <span className="font-medium">Login with Email</span>
            <span className="text-xs text-gray-200">Save searches & get full features</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

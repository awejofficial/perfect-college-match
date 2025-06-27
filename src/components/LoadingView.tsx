
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const LoadingView: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <Card className="text-center animate-scale-in shadow-2xl">
        <CardHeader>
          <LoadingSpinner />
          <CardTitle className="mt-4 text-slate-800">Loading Application...</CardTitle>
          <CardDescription>Preparing your college finder experience</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

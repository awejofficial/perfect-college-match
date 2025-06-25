
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Building, GitBranch } from "lucide-react";
import { CollegeManagement } from "@/components/admin/CollegeManagement";
import { BranchManagement } from "@/components/admin/BranchManagement";
import { Footer } from "@/components/Footer";

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              Admin Panel
            </h1>
            <p className="text-gray-600">Manage colleges and branches reference data</p>
          </div>

          <Tabs defaultValue="colleges" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="colleges" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Colleges
              </TabsTrigger>
              <TabsTrigger value="branches" className="flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Branches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colleges">
              <CollegeManagement />
            </TabsContent>

            <TabsContent value="branches">
              <BranchManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Calendar, Shield } from "lucide-react";

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [lastUploadDate, setLastUploadDate] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.username === 'awej' && credentials.password === 'awej') {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel!"
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/pdf'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel, CSV, or PDF file.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentDate = new Date().toLocaleString();
      setLastUploadDate(currentDate);
      
      toast({
        title: "File Uploaded Successfully",
        description: `Cutoff data updated on ${currentDate}. This file will now be used for all student queries.`
      });
      
      setUploadedFile(null);
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload the cutoff file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ username: '', password: '' });
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully."
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({...prev, username: e.target.value}))}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                  placeholder="Enter password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login to Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage cutoff data for MyDSE Options</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Cutoff Data
              </CardTitle>
              <CardDescription>
                Upload the latest CAP cutoff list to update the system database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cutoffFile">Cutoff File (Excel, CSV, or PDF)</Label>
                  <Input
                    id="cutoffFile"
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf"
                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                    required
                  />
                  {uploadedFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {uploadedFile.name}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isUploading} className="w-full">
                  {isUploading ? 'Uploading...' : 'Upload Cutoff Data'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>
                Current status of the cutoff database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-800">Database Status</p>
                  <p className="text-sm text-green-600">Active and Ready</p>
                </div>
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
              
              {lastUploadDate && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-800">Last Upload</p>
                  <p className="text-sm text-blue-600">{lastUploadDate}</p>
                </div>
              )}
              
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-800">Supported Formats</p>
                <p className="text-sm text-gray-600">Excel (.xlsx, .xls), CSV (.csv), PDF (.pdf)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Upload the latest CAP cutoff list containing college-wise cutoffs for all rounds</p>
              <p>• Supported file formats: Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf)</p>
              <p>• The uploaded file will replace the existing cutoff data</p>
              <p>• All student queries will use the newly uploaded data immediately</p>
              <p>• Ensure the file contains complete information for accurate AI analysis</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;

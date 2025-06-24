
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Calendar, Shield, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { fetchUploadHistory, type UploadRecord } from "@/services/databaseService";
import type { User } from '@supabase/supabase-js';

interface RecentActivity {
  id: string;
  action: string;
  fileName: string;
  category: string;
  timestamp: string;
  status: 'success' | 'error';
}

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadRecord[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File | null}>({
    'Round 1': null,
    'Round 2': null,
    'Round 3': null
  });
  const [uploadingRounds, setUploadingRounds] = useState<{[key: string]: boolean}>({
    'Round 1': false,
    'Round 2': false,
    'Round 3': false
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAdmin && user) {
      loadUploadHistory();
    }
  }, [isAdmin, user]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/admin-auth');
        return;
      }

      setUser(session.user);
      
      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Error checking admin role:', roleError);
        toast({
          title: "Error",
          description: "Failed to verify admin permissions.",
          variant: "destructive"
        });
        return;
      }

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions. Please contact the administrator.",
          variant: "destructive"
        });
        navigate('/admin-auth');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin-auth');
    } finally {
      setLoading(false);
    }
  };

  const loadUploadHistory = async () => {
    try {
      const history = await fetchUploadHistory(user?.id);
      setUploadedFiles(history);
      
      // Convert to recent activities format
      const activities: RecentActivity[] = history.map(record => ({
        id: record.id,
        action: 'File Uploaded',
        fileName: record.filename,
        category: record.category,
        timestamp: new Date(record.uploaded_at).toLocaleString(),
        status: record.status === 'Processed' ? 'success' : 'error'
      }));
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to load upload history:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin-auth');
  };

  const handleFileUpload = async (category: string) => {
    const file = selectedFiles[category];
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: `Please select a file for ${category} cutoff.`,
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

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel, CSV, or PDF file.",
        variant: "destructive"
      });
      return;
    }

    setUploadingRounds(prev => ({ ...prev, [category]: true }));
    
    try {
      // Upload to Supabase Storage
      const fileName = `${category.toLowerCase().replace(' ', '_')}_${Date.now()}_${file.name}`;
      
      // Check if bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'cutoff-uploads');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('cutoff-uploads', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
        });
      }

      const { error: uploadError } = await supabase.storage
        .from('cutoff-uploads')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Record upload in database
      const { error: dbError } = await supabase
        .from('uploads')
        .insert({
          filename: fileName,
          category: category,
          uploaded_by: user?.id,
          status: 'Processed'
        });

      if (dbError) {
        throw dbError;
      }

      const currentDate = new Date().toLocaleString();
      
      // Add to recent activities
      const newActivity: RecentActivity = {
        id: `activity-${Date.now()}`,
        action: 'File Uploaded',
        fileName: file.name,
        category: category,
        timestamp: currentDate,
        status: 'success'
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      
      toast({
        title: "File Uploaded Successfully",
        description: `${category} cutoff data uploaded and stored in Supabase Storage.`
      });
      
      setSelectedFiles(prev => ({ ...prev, [category]: null }));
      
      // Reload upload history
      await loadUploadHistory();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      
      const newActivity: RecentActivity = {
        id: `activity-${Date.now()}`,
        action: 'Upload Failed',
        fileName: file.name,
        category: category,
        timestamp: new Date().toLocaleString(),
        status: 'error'
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      
      toast({
        title: "Upload Failed",
        description: error.message || `Failed to upload ${category} cutoff file. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setUploadingRounds(prev => ({ ...prev, [category]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
              <CardDescription>
                You don't have admin permissions for this system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/admin-auth')} className="w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col">
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage cutoff data for DSE College Finder</p>
              {user && (
                <p className="text-sm text-gray-500 mt-1">Logged in as: {user.email}</p>
              )}
            </div>
            <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {['Round 1', 'Round 2', 'Round 3'].map((category) => (
              <Card key={category} className="relative">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="h-5 w-5" />
                    {category} Cutoff
                  </CardTitle>
                  <CardDescription>
                    Upload CAP {category} cutoff list
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`cutoffFile${category}`}>Cutoff File (Excel, CSV, or PDF)</Label>
                    <Input
                      id={`cutoffFile${category}`}
                      type="file"
                      accept=".xlsx,.xls,.csv,.pdf"
                      onChange={(e) => setSelectedFiles(prev => ({ 
                        ...prev, 
                        [category]: e.target.files?.[0] || null 
                      }))}
                    />
                    {selectedFiles[category] && (
                      <p className="text-sm text-gray-600">
                        Selected: {selectedFiles[category]?.name}
                      </p>
                    )}
                  </div>
                  
                  {/* Current File Status */}
                  {uploadedFiles.find(f => f.category === category) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-800">Current File</p>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {uploadedFiles.find(f => f.category === category)?.filename.split('_').pop()}
                      </p>
                      <p className="text-xs text-green-500">
                        Uploaded: {new Date(uploadedFiles.find(f => f.category === category)?.uploaded_at || '').toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => handleFileUpload(category)}
                    disabled={uploadingRounds[category]} 
                    className="w-full"
                    size="sm"
                  >
                    {uploadingRounds[category] ? 'Uploading...' : `Upload ${category}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status and Activities Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                
                <div className="space-y-2">
                  <p className="font-medium text-gray-800">Uploaded Files Status</p>
                  {['Round 1', 'Round 2', 'Round 3'].map(category => {
                    const file = uploadedFiles.find(f => f.category === category);
                    return (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-2">
                          {file ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-600">Uploaded</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">Not uploaded</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>
                  Latest upload activities and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activities
                    </p>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {activity.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action} - {activity.category}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {activity.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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
                <p>• Upload cutoff files for all three CAP rounds separately</p>
                <p>• Supported file formats: Excel (.xlsx, .xls), CSV (.csv), or PDF (.pdf)</p>
                <p>• Files are securely stored in Supabase Storage with metadata in database</p>
                <p>• Each round file will be processed and used for real-time student queries</p>
                <p>• Students with aggregate ≥ cutoff for their category will see matching colleges</p>
                <p>• All data shown to users comes directly from uploaded files (no mock data)</p>
                <p>• <strong>Note:</strong> PDF parsing is currently simulated. Real parsing will be implemented in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;

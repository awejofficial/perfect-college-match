
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  fetchColleges,
  createCollege,
  updateCollege,
  deleteCollege,
  type CollegeId
} from "@/services/adminService";

export const CollegeManagement: React.FC = () => {
  const [colleges, setColleges] = useState<CollegeId[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    const data = await fetchColleges();
    setColleges(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newCollegeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a college name",
        variant: "destructive"
      });
      return;
    }

    const newCollege = await createCollege(newCollegeName.trim());
    if (newCollege) {
      setColleges([...colleges, newCollege]);
      setNewCollegeName('');
      setIsAdding(false);
      toast({
        title: "Success",
        description: "College added successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add college",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (college: CollegeId) => {
    setEditingId(college.college_id);
    setEditingName(college.college_name);
  };

  const handleSave = async (collegeId: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a college name",
        variant: "destructive"
      });
      return;
    }

    const success = await updateCollege(collegeId, editingName.trim());
    if (success) {
      setColleges(colleges.map(c => 
        c.college_id === collegeId 
          ? { ...c, college_name: editingName.trim() }
          : c
      ));
      setEditingId(null);
      setEditingName('');
      toast({
        title: "Success",
        description: "College updated successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update college",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (collegeId: string) => {
    if (!confirm("Are you sure you want to delete this college? This will also delete all associated branches.")) {
      return;
    }

    const success = await deleteCollege(collegeId);
    if (success) {
      setColleges(colleges.filter(c => c.college_id !== collegeId));
      toast({
        title: "Success",
        description: "College deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete college",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setIsAdding(false);
    setNewCollegeName('');
  };

  if (loading) {
    return <div className="text-center">Loading colleges...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          College Management
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Add College
          </Button>
        </CardTitle>
        <CardDescription>
          Manage college names and IDs used in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="newCollege">College Name</Label>
                <Input
                  id="newCollege"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  placeholder="Enter college name"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleAdd} size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>College Name</TableHead>
                <TableHead>College ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colleges.map((college) => (
                <TableRow key={college.college_id}>
                  <TableCell>
                    {editingId === college.college_id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{college.college_name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {college.college_id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(college.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === college.college_id ? (
                        <>
                          <Button
                            onClick={() => handleSave(college.college_id)}
                            size="sm"
                            variant="default"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={handleCancel}
                            size="sm"
                            variant="outline"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleEdit(college)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(college.college_id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {colleges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No colleges found. Add a college to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

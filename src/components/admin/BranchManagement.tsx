
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchColleges,
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  type CollegeId,
  type BranchId
} from "@/services/adminService";

export const BranchManagement: React.FC = () => {
  const [colleges, setColleges] = useState<CollegeId[]>([]);
  const [branches, setBranches] = useState<BranchId[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCollegeId, setNewBranchCollegeId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBranches();
  }, [selectedCollegeId]);

  const loadData = async () => {
    setLoading(true);
    const collegeData = await fetchColleges();
    setColleges(collegeData);
    setLoading(false);
  };

  const loadBranches = async () => {
    const branchData = await fetchBranches(selectedCollegeId || undefined);
    setBranches(branchData);
  };

  const getCollegeName = (collegeId: string) => {
    const college = colleges.find(c => c.college_id === collegeId);
    return college?.college_name || 'Unknown';
  };

  const handleAdd = async () => {
    if (!newBranchName.trim() || !newBranchCollegeId) {
      toast({
        title: "Error",
        description: "Please enter branch name and select a college",
        variant: "destructive"
      });
      return;
    }

    const newBranch = await createBranch(newBranchCollegeId, newBranchName.trim());
    if (newBranch) {
      setBranches([...branches, newBranch]);
      setNewBranchName('');
      setNewBranchCollegeId('');
      setIsAdding(false);
      toast({
        title: "Success",
        description: "Branch added successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add branch",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (branch: BranchId) => {
    setEditingId(branch.branch_id);
    setEditingName(branch.branch_name);
  };

  const handleSave = async (branchId: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a branch name",
        variant: "destructive"
      });
      return;
    }

    const success = await updateBranch(branchId, editingName.trim());
    if (success) {
      setBranches(branches.map(b => 
        b.branch_id === branchId 
          ? { ...b, branch_name: editingName.trim() }
          : b
      ));
      setEditingId(null);
      setEditingName('');
      toast({
        title: "Success",
        description: "Branch updated successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update branch",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) {
      return;
    }

    const success = await deleteBranch(branchId);
    if (success) {
      setBranches(branches.filter(b => b.branch_id !== branchId));
      toast({
        title: "Success",
        description: "Branch deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete branch",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setIsAdding(false);
    setNewBranchName('');
    setNewBranchCollegeId('');
  };

  if (loading) {
    return <div className="text-center">Loading branches...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Branch Management
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        </CardTitle>
        <CardDescription>
          Manage branch names and IDs for each college
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="collegeFilter">Filter by College</Label>
          <Select value={selectedCollegeId} onValueChange={setSelectedCollegeId}>
            <SelectTrigger>
              <SelectValue placeholder="All Colleges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Colleges</SelectItem>
              {colleges.map((college) => (
                <SelectItem key={college.college_id} value={college.college_id}>
                  {college.college_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newBranchCollege">College</Label>
                <Select value={newBranchCollegeId} onValueChange={setNewBranchCollegeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select College" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.college_id} value={college.college_id}>
                        {college.college_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newBranch">Branch Name</Label>
                <Input
                  id="newBranch"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
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
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Branch ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.branch_id}>
                  <TableCell>
                    {editingId === branch.branch_id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="font-medium">{branch.branch_name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getCollegeName(branch.college_id)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {branch.branch_id}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(branch.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === branch.branch_id ? (
                        <>
                          <Button
                            onClick={() => handleSave(branch.branch_id)}
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
                            onClick={() => handleEdit(branch)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(branch.branch_id)}
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

        {branches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No branches found. Add a branch to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

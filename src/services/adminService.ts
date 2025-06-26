
import { supabase } from "@/integrations/supabase/client";

export interface CollegeId {
  college_id: string;
  college_name: string;
  created_at: string;
}

export interface BranchId {
  branch_id: string;
  college_id: string;
  branch_name: string;
  created_at: string;
}

// Fetch colleges (now automatically populated from cutoffs table)
export const fetchColleges = async (): Promise<CollegeId[]> => {
  try {
    const { data, error } = await supabase
      .from('college_ids')
      .select('*')
      .order('college_name', { ascending: true });

    if (error) {
      console.error('Error fetching colleges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch colleges:', error);
    return [];
  }
};

// Fetch branches (now automatically populated from cutoffs table)
export const fetchBranches = async (collegeId?: string): Promise<BranchId[]> => {
  try {
    let query = supabase
      .from('branch_ids')
      .select('*')
      .order('branch_name', { ascending: true });

    if (collegeId) {
      query = query.eq('college_id', collegeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching branches:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    return [];
  }
};

// Create college - will be automatically synced when cutoffs are added
export const createCollege = async (collegeName: string): Promise<CollegeId | null> => {
  try {
    const { data, error } = await supabase
      .from('college_ids')
      .insert([{ college_name: collegeName }])
      .select()
      .single();

    if (error) {
      console.error('Error creating college:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to create college:', error);
    return null;
  }
};

// Update college name
export const updateCollege = async (collegeId: string, collegeName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('college_ids')
      .update({ college_name: collegeName })
      .eq('college_id', collegeId);

    if (error) {
      console.error('Error updating college:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update college:', error);
    return false;
  }
};

// Delete college - Note: This will also affect related cutoffs data integrity
export const deleteCollege = async (collegeId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('college_ids')
      .delete()
      .eq('college_id', collegeId);

    if (error) {
      console.error('Error deleting college:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete college:', error);
    return false;
  }
};

// Create branch - will be automatically synced when cutoffs are added
export const createBranch = async (collegeId: string, branchName: string): Promise<BranchId | null> => {
  try {
    const { data, error } = await supabase
      .from('branch_ids')
      .insert([{ college_id: collegeId, branch_name: branchName }])
      .select()
      .single();

    if (error) {
      console.error('Error creating branch:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to create branch:', error);
    return null;
  }
};

// Update branch name
export const updateBranch = async (branchId: string, branchName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('branch_ids')
      .update({ branch_name: branchName })
      .eq('branch_id', branchId);

    if (error) {
      console.error('Error updating branch:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update branch:', error);
    return false;
  }
};

// Delete branch - Note: This will also affect related cutoffs data integrity
export const deleteBranch = async (branchId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('branch_ids')
      .delete()
      .eq('branch_id', branchId);

    if (error) {
      console.error('Error deleting branch:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete branch:', error);
    return false;
  }
};

// New function to sync a manual cutoff record (triggers auto-sync)
export const syncCutoffRecord = async (cutoffData: {
  college_name: string;
  branch_name: string;
  category: string;
  college_type: string;
  cap1_cutoff?: number;
  cap2_cutoff?: number;
  cap3_cutoff?: number;
  city?: string;
  year?: number;
}): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('cutoffs')
      .insert([cutoffData]);

    if (error) {
      console.error('Error syncing cutoff record:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to sync cutoff record:', error);
    return false;
  }
};

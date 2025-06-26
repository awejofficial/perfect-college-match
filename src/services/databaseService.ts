
import { supabase } from "@/integrations/supabase/client";

export interface CutoffRecord {
  id: string;
  college_name: string;
  branch_name: string;
  category: string;
  cap1_cutoff: number;
  cap2_cutoff?: number | null;
  cap3_cutoff?: number | null;
  city?: string;
  college_type: string;
  year?: number;
}

export interface UploadRecord {
  id: string;
  filename: string;
  category: string;
  status: string;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface CollegeWithBranches {
  college_id: string;
  college_name: string;
  college_type: string;
  branches: Array<{
    branch_id: string;
    branch_name: string;
  }>;
}

export const fetchCutoffData = async (
  category?: string,
  branch?: string,
  collegeTypes?: string[]
): Promise<CutoffRecord[]> => {
  try {
    let query = supabase
      .from('cutoffs')
      .select('*')
      .order('cap1_cutoff', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (branch) {
      query = query.eq('branch_name', branch);
    }

    if (collegeTypes && collegeTypes.length > 0) {
      query = query.in('college_type', collegeTypes);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch cutoff data:', error);
    return [];
  }
};

export const fetchUploadHistory = async (userId?: string): Promise<UploadRecord[]> => {
  try {
    let query = supabase
      .from('uploads')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (userId) {
      query = query.eq('uploaded_by', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch upload history:', error);
    return [];
  }
};

export const fetchPaginatedCutoffs = async (
  page: number = 1,
  limit: number = 20,
  filters: {
    category?: string;
    branch?: string;
    collegeTypes?: string[];
    minScore?: number;
  } = {}
): Promise<{ data: CutoffRecord[]; total: number; totalPages: number }> => {
  try {
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('cutoffs')
      .select('*', { count: 'exact' })
      .order('cap1_cutoff', { ascending: true })
      .range(offset, offset + limit - 1);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.branch) {
      query = query.eq('branch_name', filters.branch);
    }

    if (filters.collegeTypes && filters.collegeTypes.length > 0) {
      query = query.in('college_type', filters.collegeTypes);
    }

    if (filters.minScore) {
      query = query.lte('cap1_cutoff', filters.minScore);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return { data: [], total: 0, totalPages: 0 };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      totalPages
    };
  } catch (error) {
    console.error('Failed to fetch paginated cutoffs:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
};

export const fetchAvailableCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc('get_available_categories');

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data?.map((item: { category: string }) => item.category) || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
};

export const fetchAvailableBranches = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('branch_ids')
      .select('branch_name')
      .order('branch_name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    const branches = [...new Set(data?.map(item => item.branch_name) || [])];
    return branches;
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    return [];
  }
};

export const fetchAvailableCollegeTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('cutoffs')
      .select('college_type')
      .not('college_type', 'is', null);

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    const types = [...new Set(data?.map(item => item.college_type) || [])];
    return types.sort();
  } catch (error) {
    console.error('Failed to fetch college types:', error);
    return [];
  }
};

export const fetchCollegesWithBranches = async (): Promise<CollegeWithBranches[]> => {
  try {
    const { data, error } = await supabase.rpc('get_colleges_with_branches');

    if (error) {
      console.error('Database error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch colleges with branches:', error);
    return [];
  }
};

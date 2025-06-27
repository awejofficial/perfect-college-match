
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { 
  fetchCutoffData, 
  fetchAvailableCollegeTypes, 
  fetchAvailableCategories,
  fetchAvailableBranches,
  fetchAllCollegeNames,
  type CutoffRecord 
} from "@/services/databaseService";

export const useCollegeData = () => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableCollegeTypes, setAvailableCollegeTypes] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const loadAvailableOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [categories, branches, collegeTypes] = await Promise.all([
        fetchAvailableCategories(),
        fetchAvailableBranches(),
        fetchAvailableCollegeTypes()
      ]);
      
      console.log('Loaded options:', { categories, branches, collegeTypes });
      
      setAvailableCategories(categories);
      setAvailableBranches(branches);
      setAvailableCollegeTypes(collegeTypes);
    } catch (error) {
      console.error('Failed to load options:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load form options. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadAvailableOptions();
  }, []);

  return {
    availableCategories,
    availableBranches,
    availableCollegeTypes,
    isLoadingOptions
  };
};

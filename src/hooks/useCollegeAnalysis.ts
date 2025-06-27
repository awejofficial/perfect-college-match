
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { fetchCutoffData, fetchAllCollegeNames, type CutoffRecord } from "@/services/databaseService";

interface CollegeMatch {
  collegeName: string;
  city: string;
  branch: string;
  category: string;
  collegeType: string;
  cap1Cutoff: number | null;
  cap2Cutoff: number | null;
  cap3Cutoff: number | null;
  eligible: boolean;
}

interface FormData {
  fullName: string;
  aggregate: string;
  category: string;
  preferredBranches: string[];
  collegeTypes: string[];
  selectedColleges: string[];
}

export const useCollegeAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CollegeMatch[]>([]);

  const processCollegeMatches = (cutoffData: CutoffRecord[], studentAggregate: number): CollegeMatch[] => {
    const uniqueCombinations = new Map<string, CutoffRecord>();
    
    cutoffData.forEach(record => {
      const key = `${record.college_name}-${record.branch_name}-${record.category}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, record);
      }
    });

    const matches: CollegeMatch[] = Array.from(uniqueCombinations.values()).map(record => {
      const eligibleForCap1 = record.cap1_cutoff ? studentAggregate >= record.cap1_cutoff : false;
      const eligibleForCap2 = record.cap2_cutoff ? studentAggregate >= record.cap2_cutoff : false;
      const eligibleForCap3 = record.cap3_cutoff ? studentAggregate >= record.cap3_cutoff : false;
      
      const eligible = eligibleForCap1 || eligibleForCap2 || eligibleForCap3;

      return {
        collegeName: record.college_name,
        city: record.city || 'Unknown',
        branch: record.branch_name,
        category: record.category,
        collegeType: record.college_type,
        cap1Cutoff: record.cap1_cutoff || null,
        cap2Cutoff: record.cap2_cutoff || null,
        cap3Cutoff: record.cap3_cutoff || null,
        eligible
      };
    });

    return matches.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      
      const getLowestCutoff = (college: CollegeMatch) => {
        const cutoffs = [college.cap1Cutoff, college.cap2Cutoff, college.cap3Cutoff]
          .filter(c => c !== null) as number[];
        return cutoffs.length > 0 ? Math.min(...cutoffs) : 100;
      };
      
      return getLowestCutoff(a) - getLowestCutoff(b);
    });
  };

  const analyzeColleges = async (formData: FormData) => {
    const aggregate = parseFloat(formData.aggregate);
    setIsAnalyzing(true);
    
    try {
      let collegesToSearch = formData.selectedColleges;
      if (collegesToSearch.length === 0) {
        const allColleges = await fetchAllCollegeNames();
        collegesToSearch = allColleges;
      }

      console.log('Fetching data for branches:', formData.preferredBranches);
      console.log('Category:', formData.category);
      console.log('College types filter:', formData.collegeTypes);
      console.log('Colleges to search:', collegesToSearch.length);
      
      const allCutoffData: CutoffRecord[] = [];
      
      for (const branch of formData.preferredBranches) {
        const branchData = await fetchCutoffData(
          formData.category,
          branch,
          formData.collegeTypes.length > 0 ? formData.collegeTypes : undefined
        );
        allCutoffData.push(...branchData);
      }

      console.log('Total cutoff records found:', allCutoffData.length);

      if (allCutoffData.length === 0) {
        toast({
          title: "No Data Available",
          description: "No cutoff data found for your selected criteria. Try different options or contact admin.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return false;
      }

      const collegeMatches = processCollegeMatches(allCutoffData, aggregate);
      console.log('Processed matches:', collegeMatches.length);
      
      setResults(collegeMatches);
      
      const eligibleCount = collegeMatches.filter(college => college.eligible).length;
      
      toast({
        title: "Analysis Complete!",
        description: `Found ${collegeMatches.length} college options (${eligibleCount} eligible) for ${formData.fullName}.`
      });

      return true;
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze college options. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    results,
    analyzeColleges
  };
};

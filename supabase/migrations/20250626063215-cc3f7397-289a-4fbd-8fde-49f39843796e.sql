
-- Create function to get all college names
CREATE OR REPLACE FUNCTION public.get_all_college_names()
RETURNS TABLE(college_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.college_name
  FROM cutoffs c
  WHERE c.college_name IS NOT NULL
  ORDER BY c.college_name;
END;
$$;

-- Create function to get college types for selected colleges
CREATE OR REPLACE FUNCTION public.get_college_types_for_colleges(college_names text[])
RETURNS TABLE(college_name text, college_type text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.college_name, c.college_type
  FROM cutoffs c
  WHERE c.college_name = ANY(college_names)
  AND c.college_name IS NOT NULL
  AND c.college_type IS NOT NULL
  ORDER BY c.college_name;
END;
$$;

-- Create function to get branches for selected colleges
CREATE OR REPLACE FUNCTION public.get_branches_for_colleges(college_names text[])
RETURNS TABLE(college_name text, branch_name text)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.college_name, c.branch_name
  FROM cutoffs c
  WHERE c.college_name = ANY(college_names)
  AND c.college_name IS NOT NULL
  AND c.branch_name IS NOT NULL
  ORDER BY c.college_name, c.branch_name;
END;
$$;

-- Update the existing function to work with the current schema
CREATE OR REPLACE FUNCTION public.get_colleges_with_branches_and_types()
RETURNS TABLE(college_id text, college_name text, college_type text, branches jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.college_name as college_id,
    c.college_name,
    c.college_type,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'branch_id', c.branch_name,
          'branch_name', c.branch_name
        )
        ORDER BY c.branch_name
      ) FILTER (WHERE c.branch_name IS NOT NULL),
      '[]'::jsonb
    ) as branches
  FROM (
    SELECT DISTINCT college_name, college_type, branch_name
    FROM cutoffs
    WHERE college_name IS NOT NULL
  ) c
  GROUP BY c.college_name, c.college_type
  ORDER BY c.college_name;
END;
$$;

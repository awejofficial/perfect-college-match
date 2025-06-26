
-- Create trigger function to automatically sync college and branch IDs from cutoffs table
CREATE OR REPLACE FUNCTION public.sync_college_and_branch_ids()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert new college if it doesn't exist
  INSERT INTO college_ids (college_name)
  VALUES (NEW.college_name)
  ON CONFLICT (college_name) DO NOTHING;
  
  -- Insert new branch for the college if it doesn't exist
  INSERT INTO branch_ids (college_id, branch_name)
  SELECT c.college_id, NEW.branch_name
  FROM college_ids c
  WHERE c.college_name = NEW.college_name
  ON CONFLICT (college_id, branch_name) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically sync data on INSERT or UPDATE
DROP TRIGGER IF EXISTS sync_ids_trigger ON cutoffs;
CREATE TRIGGER sync_ids_trigger
  AFTER INSERT OR UPDATE ON cutoffs
  FOR EACH ROW
  EXECUTE FUNCTION sync_college_and_branch_ids();

-- Create function to get available categories from cutoffs table
CREATE OR REPLACE FUNCTION public.get_available_categories()
RETURNS TABLE(category text)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.category
  FROM cutoffs c
  WHERE c.category IS NOT NULL
  ORDER BY c.category;
END;
$function$;

-- Create function to get college type for a specific college
CREATE OR REPLACE FUNCTION public.get_college_type(college_name_param text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  college_type_result TEXT;
BEGIN
  SELECT DISTINCT c.college_type
  INTO college_type_result
  FROM cutoffs c
  WHERE c.college_name = college_name_param
  LIMIT 1;
  
  RETURN college_type_result;
END;
$function$;

-- Create function to get colleges with their branches in a hierarchical structure
CREATE OR REPLACE FUNCTION public.get_colleges_with_branches()
RETURNS TABLE(college_id uuid, college_name text, college_type text, branches jsonb)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ci.college_id,
    ci.college_name,
    get_college_type(ci.college_name) as college_type,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'branch_id', bi.branch_id,
          'branch_name', bi.branch_name
        )
        ORDER BY bi.branch_name
      ) FILTER (WHERE bi.branch_id IS NOT NULL),
      '[]'::jsonb
    ) as branches
  FROM college_ids ci
  LEFT JOIN branch_ids bi ON ci.college_id = bi.college_id
  GROUP BY ci.college_id, ci.college_name
  ORDER BY ci.college_name;
END;
$function$;

-- Populate existing data from cutoffs table
INSERT INTO college_ids (college_name)
SELECT DISTINCT college_name FROM cutoffs
WHERE college_name IS NOT NULL
ON CONFLICT (college_name) DO NOTHING;

-- Populate branch_ids with existing data
INSERT INTO branch_ids (college_id, branch_name)
SELECT
  c.college_id,
  ct.branch_name
FROM (
  SELECT DISTINCT college_name, branch_name 
  FROM cutoffs 
  WHERE college_name IS NOT NULL AND branch_name IS NOT NULL
) ct
JOIN college_ids c ON ct.college_name = c.college_name
ON CONFLICT (college_id, branch_name) DO NOTHING;

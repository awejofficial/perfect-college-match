
-- Create unique colleges table
CREATE TABLE IF NOT EXISTS college_ids (
  college_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique branches per college table
CREATE TABLE IF NOT EXISTS branch_ids (
  branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID REFERENCES college_ids(college_id) ON DELETE CASCADE,
  branch_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (college_id, branch_name)
);

-- Insert distinct colleges from cutoffs table
INSERT INTO college_ids (college_name)
SELECT DISTINCT college_name FROM cutoffs
WHERE college_name IS NOT NULL
ON CONFLICT (college_name) DO NOTHING;

-- Insert distinct (college, branch) combinations
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

-- Enable RLS on both tables for admin access control
ALTER TABLE college_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_ids ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage college_ids" ON college_ids
FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage branch_ids" ON branch_ids
FOR ALL USING (public.is_admin(auth.uid()));

-- Create policies for read access (for general use)
CREATE POLICY "Anyone can view college_ids" ON college_ids
FOR SELECT USING (true);

CREATE POLICY "Anyone can view branch_ids" ON branch_ids
FOR SELECT USING (true);

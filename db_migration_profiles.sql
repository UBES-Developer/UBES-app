
-- Add Staff attributes to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position TEXT; -- e.g. 'Senior Lecturer'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT; -- e.g. 'Physics'

-- Index for search
CREATE INDEX IF NOT EXISTS idx_profiles_role_dept ON public.profiles(role, department);

-- Ensure Consultations table (created in previous step, but safe to repeat IF NOT EXISTS)
-- (Already in db_schema_staff.sql, so we skip recreation)

-- RLS Policy Template for Role-Based Access Control
-- Use this template to secure tables like 'grades', 'submissions', etc.

-- 1. Create the table (Example: grades)
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id),
    module_code TEXT NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (Default Deny)
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- 3. Define Policies

-- POLICY A: Students can ONLY view their own grades
-- "Student logs in: The database checks... student_id matches their ID."
CREATE POLICY "Students view own grades" 
    ON public.grades 
    FOR SELECT 
    USING (auth.uid() = student_id);

-- POLICY B: Lecturers can view ALL grades
-- "Lecturer logs in: The database checks... confirms they have a 'lecturer' role... grants access to all rows."
CREATE POLICY "Lecturers view all grades" 
    ON public.grades 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'lecturer' -- or IN ('lecturer', 'admin')
        )
    );

-- POLICY C: Lecturers can INSERT/UPDATE grades
CREATE POLICY "Lecturers manage grades" 
    ON public.grades 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'lecturer'
        )
    );

-- NOTE: "Hacker/Random user" gets [] (empty array) because no policy matches them.

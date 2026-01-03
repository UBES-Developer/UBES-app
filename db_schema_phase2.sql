-- Add grading columns
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS grade INTEGER CHECK (grade >= 0 AND grade <= 100),
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Update RLS to allow Lecturers to view/grade ALL assignments
-- First, drop the strict "own only" policy
DROP POLICY IF EXISTS "Users can only see their own assignments" ON public.assignments;

-- Create comprehensive policies
-- 1. Students: View/Edit own
CREATE POLICY "Students manage own assignments" 
    ON public.assignments 
    FOR ALL 
    USING (auth.uid() = student_id);

-- 2. Lecturers/Admins: View ALL
CREATE POLICY "Lecturers view all assignments" 
    ON public.assignments 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('lecturer', 'admin', 'staff')
        )
    );

-- 3. Lecturers/Admins: Update ALL (Grading)
CREATE POLICY "Lecturers grade assignments" 
    ON public.assignments 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('lecturer', 'admin', 'staff')
        )
    );

-- Staff Experience Schema

-- 1. Consultations (Office Hours)
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES auth.users(id),
    student_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    total_points INTEGER DEFAULT 100,
    created_by UUID REFERENCES auth.users(id), -- Lecturer
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id),
    file_url TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    
    -- Grading
    grade INTEGER,
    feedback TEXT,
    graded_by UUID REFERENCES auth.users(id),
    graded_at TIMESTAMPTZ,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'late')),
    
    UNIQUE(assignment_id, student_id)
);

-- RLS

-- Consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage their consultations" ON public.consultations
    USING (auth.uid() = staff_id);

CREATE POLICY "Students manage their consultations" ON public.consultations
    USING (auth.uid() = student_id);

-- Assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone view assignments" ON public.assignments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff manage assignments" ON public.assignments
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin'))
    );

-- Submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own submissions" ON public.submissions
    USING (auth.uid() = student_id);

CREATE POLICY "Students create submissions" ON public.submissions
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Staff view and grade submissions" ON public.submissions
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin'))
    );

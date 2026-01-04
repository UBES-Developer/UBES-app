-- Assignment System CI Pipeline Schema

-- 1. Enums for Workflow States
CREATE TYPE public.submission_status AS ENUM (
    'draft',        -- Student is working on it (Attempts reopened)
    'submitted',    -- Final submission made (locked unless reopened)
    'in_marking',   -- Lecturer has started grading (hidden from student)
    'graded',       -- Grading complete but held for batch release
    'released'      -- Feedback and grade visible to student
);

CREATE TYPE public.assignment_type AS ENUM (
    'individual',
    'group',
    'journal'
);

-- 2. Assignment Templates (Standards)
CREATE TABLE IF NOT EXISTS public.assignment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL, -- e.g. "Standard Lab Report"
    department TEXT, -- e.g. "Mechanical Engineering"
    description TEXT,
    grading_criteria JSONB, -- AI prompts e.g. {"criteria": ["Grammar", "Logic"], "weight": [20, 80]}
    settings JSONB, -- e.g. {"allow_drafts": true, "plagiarism_check": true}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_module TEXT NOT NULL, -- e.g. "MECH201"
    template_id UUID REFERENCES public.assignment_templates(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    
    -- Configuration specific to this instance
    allow_drafts BOOLEAN DEFAULT true,
    require_integrity_pledge BOOLEAN DEFAULT true,
    
    -- Status
    is_published BOOLEAN DEFAULT false,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Submissions Table (The "Agile" Artifact)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id),
    
    -- Content
    content_url TEXT, -- Link to PDF/Doc
    content_text TEXT, -- For direct text entry
    
    -- Workflow
    status public.submission_status DEFAULT 'draft',
    attempt_number INTEGER DEFAULT 1,
    integrity_pledge_signed BOOLEAN DEFAULT false,
    
    -- Feedback & Grading
    ai_pre_grade_score NUMERIC, -- Suggested by AI
    ai_feedback_notes TEXT, -- Private to lecturer or sharable
    
    final_grade NUMERIC,
    lecturer_feedback TEXT,
    
    last_updated TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_assignments_module ON public.assignments(course_module);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);

-- RLS Policies
ALTER TABLE public.assignment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Templates: Viewable by Staff/Lecturers, Editable by Admins/Staff
CREATE POLICY "Staff view templates" ON public.assignment_templates 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin'))
    );

-- Assignments: Viewable by everyone (filtered by module in app), Editable by creators/staff
CREATE POLICY "Public view assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff manage assignments" ON public.assignments 
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin'))
    );

-- Submissions: 
-- Student can view/edit their own.
-- Lecturers/Staff can view all for grading.
CREATE POLICY "Student manage own submission" ON public.submissions
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "Staff view all submissions" ON public.submissions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin'))
    );

CREATE POLICY "Staff grade submissions" ON public.submissions
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin'))
    );

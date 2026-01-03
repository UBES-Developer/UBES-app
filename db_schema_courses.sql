-- Courses and Registration System

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- e.g., 'CS101'
    name TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    semester TEXT DEFAULT 'Semester 1',
    faculty TEXT, -- e.g., 'Engineering', 'Science'
    capacity INTEGER DEFAULT 100,
    enrolled_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id),
    course_id UUID REFERENCES public.courses(id),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, course_id)
);

-- 3. Course Schedule (Timetable)
CREATE TABLE IF NOT EXISTS public.course_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT, -- e.g., 'Room 301', 'Lab A'
    session_type TEXT CHECK (session_type IN ('Lecture', 'Tutorial', 'Lab', 'Seminar'))
);

-- RLS Policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_schedule ENABLE ROW LEVEL SECURITY;

-- Courses: Everyone can view
CREATE POLICY "View courses" ON public.courses FOR SELECT USING (true);

-- Enrollments: CRUD for own
CREATE POLICY "Manage own enrollments" ON public.enrollments 
    USING (auth.uid() = student_id);

-- Schedule: Everyone can view
CREATE POLICY "View schedule" ON public.course_schedule FOR SELECT USING (true);


-- SEED DATA (Placeholder Modules)
INSERT INTO public.courses (code, name, description, credits, semester, faculty)
VALUES 
('CS101', 'Introduction to Computer Science', 'Fundamentals of programming and algorithms.', 4, 'Semester 1', 'Engineering'),
('MATH101', 'Calculus I', 'Limits, derivatives, and integrals.', 3, 'Semester 1', 'Science'),
('PHY101', 'Physics I', 'Mechanics and Thermodynamics.', 4, 'Semester 1', 'Science'),
('ENG102', 'Engineering Design', 'Introduction to engineering design principles.', 3, 'Semester 1', 'Engineering')
ON CONFLICT (code) DO NOTHING;

-- SEED DATA (Schedule)
-- We need IDs, so we do a subquery select.
INSERT INTO public.course_schedule (course_id, day_of_week, start_time, end_time, location, session_type)
SELECT id, 'Monday', '09:00', '11:00', 'Hall A', 'Lecture' FROM public.courses WHERE code = 'CS101';

INSERT INTO public.course_schedule (course_id, day_of_week, start_time, end_time, location, session_type)
SELECT id, 'Wednesday', '14:00', '16:00', 'Lab 3', 'Lab' FROM public.courses WHERE code = 'CS101';

INSERT INTO public.course_schedule (course_id, day_of_week, start_time, end_time, location, session_type)
SELECT id, 'Tuesday', '10:00', '12:00', 'Room 204', 'Lecture' FROM public.courses WHERE code = 'MATH101';

INSERT INTO public.course_schedule (course_id, day_of_week, start_time, end_time, location, session_type)
SELECT id, 'Thursday', '13:00', '15:00', 'Hall B', 'Lecture' FROM public.courses WHERE code = 'PHY101';

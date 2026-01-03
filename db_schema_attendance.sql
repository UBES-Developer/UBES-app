-- Attendance System Schema (Updated)

-- 1. Class Sessions
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lecturer_id UUID REFERENCES auth.users(id),
    module_code TEXT NOT NULL,
    session_date DATE DEFAULT CURRENT_DATE,
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ DEFAULT (now() + interval '1 hour'),
    
    -- Location / Verification
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 100,
    qr_code TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Scans (Student Attendance)
CREATE TABLE IF NOT EXISTS public.attendance_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id),
    scanned_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'late', 'excused')),
    
    -- Audit
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,
    
    UNIQUE(session_id, student_id)
);

-- 3. Disputes
CREATE TABLE IF NOT EXISTS public.attendance_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id),
    session_id UUID REFERENCES public.attendance_sessions(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_disputes ENABLE ROW LEVEL SECURITY;

-- Policies

-- Sessions
DROP POLICY IF EXISTS "Lecturers manage sessions" ON public.attendance_sessions;
CREATE POLICY "Lecturers manage sessions" ON public.attendance_sessions USING (auth.uid() = lecturer_id);

DROP POLICY IF EXISTS "Students view active sessions" ON public.attendance_sessions;
CREATE POLICY "Students view active sessions" ON public.attendance_sessions FOR SELECT USING (true); 

-- Scans
DROP POLICY IF EXISTS "Students insert own scans" ON public.attendance_scans;
CREATE POLICY "Students insert own scans" ON public.attendance_scans FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students view own scans" ON public.attendance_scans;
CREATE POLICY "Students view own scans" ON public.attendance_scans FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Lecturers view scans" ON public.attendance_scans;
CREATE POLICY "Lecturers view scans" ON public.attendance_scans FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.attendance_sessions WHERE id = attendance_scans.session_id AND lecturer_id = auth.uid())
);

-- Disputes
DROP POLICY IF EXISTS "Students manage own disputes" ON public.attendance_disputes;
CREATE POLICY "Students manage own disputes" ON public.attendance_disputes USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Lecturers manage disputes" ON public.attendance_disputes;
CREATE POLICY "Lecturers manage disputes" ON public.attendance_disputes USING (
    EXISTS (SELECT 1 FROM public.attendance_sessions WHERE id = attendance_disputes.session_id AND lecturer_id = auth.uid())
);

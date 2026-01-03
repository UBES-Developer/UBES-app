-- Classroom Management Schema

-- 1. Classroom Resources
CREATE TABLE IF NOT EXISTS public.classroom_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'classroom' CHECK (type IN ('classroom', 'auditorium', 'seminar_room')),
    description TEXT,
    capacity INTEGER DEFAULT 30,
    location TEXT,
    facilities JSONB DEFAULT '[]'::jsonb, -- e.g. ["Projector", "Whiteboard", "AC"]
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Classroom Bookings
CREATE TABLE IF NOT EXISTS public.classroom_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.classroom_resources(id),
    user_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    purpose TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT end_after_start_class CHECK (end_time > start_time)
);

-- RLS
ALTER TABLE public.classroom_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_bookings ENABLE ROW LEVEL SECURITY;

-- Policies

-- Resources
DROP POLICY IF EXISTS "Everyone view available classrooms" ON public.classroom_resources;
CREATE POLICY "Everyone view available classrooms" ON public.classroom_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage classrooms" ON public.classroom_resources;
CREATE POLICY "Staff manage classrooms" ON public.classroom_resources USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'lecturer'))
);

-- Bookings
DROP POLICY IF EXISTS "Users view own classroom bookings" ON public.classroom_bookings;
CREATE POLICY "Users view own classroom bookings" ON public.classroom_bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create classroom bookings" ON public.classroom_bookings;
CREATE POLICY "Users create classroom bookings" ON public.classroom_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff manage classroom bookings" ON public.classroom_bookings;
CREATE POLICY "Staff manage classroom bookings" ON public.classroom_bookings USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'lecturer'))
);

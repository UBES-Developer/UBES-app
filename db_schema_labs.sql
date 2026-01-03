-- Lab Booking System Schema

-- 1. Lab Resources
CREATE TABLE IF NOT EXISTS public.lab_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('lab', 'equipment', 'room')),
    description TEXT,
    capacity INTEGER DEFAULT 1,
    location TEXT,
    equipment JSONB DEFAULT '[]'::jsonb, -- Array of strings e.g. ["AutoCAD", "Microscope"]
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bookings
CREATE TABLE IF NOT EXISTS public.lab_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.lab_resources(id),
    user_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    purpose TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent overlapping bookings for same resource (basic constraint, but application logic handles partial overlaps better)
    -- CONSTRAINT no_overlap EXCLUDE USING gist (resource_id WITH =, tsrange(start_time, end_time) WITH &&)
    -- Note: 'tsrange' requires 'btree_gist' extension. We'll rely on app logic for now or simple unique index if slots are fixed.
    CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- RLS
ALTER TABLE public.lab_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Everyone view available labs" ON public.lab_resources;
CREATE POLICY "Everyone view available labs" ON public.lab_resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff manage labs" ON public.lab_resources;
CREATE POLICY "Staff manage labs" ON public.lab_resources USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'lecturer'))
);

DROP POLICY IF EXISTS "Users view own bookings" ON public.lab_bookings;
CREATE POLICY "Users view own bookings" ON public.lab_bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create bookings" ON public.lab_bookings;
CREATE POLICY "Users create bookings" ON public.lab_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff manage bookings" ON public.lab_bookings;
CREATE POLICY "Staff manage bookings" ON public.lab_bookings USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('staff', 'admin', 'lecturer'))
);

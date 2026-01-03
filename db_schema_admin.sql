-- Admin Experience Schema Upgrade

-- 1. User Management
-- Add status to profiles (Admissions Funnel)
DO $$ BEGIN
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'review'));
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- RPC: Get Daily Active Users
-- Uses SECURITY DEFINER to access auth.users
CREATE OR REPLACE FUNCTION public.get_daily_active_users()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT count(*) 
  FROM auth.users 
  WHERE last_sign_in_at > (now() - interval '24 hours');
$$;

-- 2. Resource Center Enhancements
-- Create ENUM if not exists (Postgres doesn't support IF NOT EXISTS for TYPE easily, so we use a block)
DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.academic_resources 
ADD COLUMN IF NOT EXISTS status resource_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index for Vetting Queue
CREATE INDEX IF NOT EXISTS idx_academic_resources_status ON public.academic_resources(status);

-- 3. Facility Scheduling (Bookings)
-- Consolidating facility bookings. If lab_bookings exists, we might reuse or migrate, 
-- but strictly following instructions to create specific structure.
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL, -- Generic link to lab_resources or others
    user_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'maintenance')),
    type TEXT DEFAULT 'booking' CHECK (type IN ('booking', 'maintenance', 'exam', 'class')),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- RLS for Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "Users create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage bookings" ON public.bookings USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Preventive Clash Detection Function
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
    target_resource_id UUID, 
    new_start_time TIMESTAMPTZ, 
    new_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.bookings
        WHERE resource_id = target_resource_id
        AND status NOT IN ('cancelled', 'rejected')
        -- OVERLAPS operator: (start1, end1) OVERLAPS (start2, end2)
        AND (start_time, end_time) OVERLAPS (new_start_time, new_end_time)
    );
END;
$$;

-- 4. Events Automation
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    organizer_id UUID REFERENCES auth.users(id),
    
    -- Requested Columns
    qr_code_url TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    
    -- RSVP capabilities
    attendees_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- RLS for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

CREATE POLICY "Users manage own rsvps" ON public.event_rsvps USING (auth.uid() = user_id);
CREATE POLICY "Everyone view rsvps" ON public.event_rsvps FOR SELECT USING (true);

-- Dynamic Lab Scheduler Schema

-- 1. Lab Resources (Equipment, Labs, Rooms)
CREATE TABLE IF NOT EXISTS public.lab_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lab', 'equipment', 'room')),
    description TEXT,
    capacity INTEGER, -- For labs/rooms
    location TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Lab Bookings
CREATE TABLE IF NOT EXISTS public.lab_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.lab_resources(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT no_overlap CHECK (start_time < end_time)
);

-- RLS
ALTER TABLE public.lab_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_bookings ENABLE ROW LEVEL SECURITY;

-- Everyone can VIEW resources
CREATE POLICY "Authenticated users can view resources" 
    ON public.lab_resources 
    FOR SELECT 
    TO authenticated
    USING (true);

-- Staff can manage resources
CREATE POLICY "Staff can manage resources" 
    ON public.lab_resources 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" 
    ON public.lab_bookings 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can view all bookings (to see availability)
CREATE POLICY "Authenticated users can view bookings" 
    ON public.lab_bookings 
    FOR SELECT 
    TO authenticated
    USING (true);

-- Users can update/cancel their own bookings
CREATE POLICY "Users can manage own bookings" 
    ON public.lab_bookings 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Staff can approve/reject any booking
CREATE POLICY "Staff can manage all bookings" 
    ON public.lab_bookings 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('staff', 'admin')
        )
    );

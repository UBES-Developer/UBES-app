-- Admin Dashboard Improvements
-- Phase 14

-- 1. System Notifications (Broadcasts)
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical', 'success')),
    target_role TEXT DEFAULT 'all', -- 'all', 'student', 'lecturer', 'staff'
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone view active notifications" 
    ON public.system_notifications FOR SELECT 
    USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins manage notifications" 
    ON public.system_notifications 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'staff')
        )
    );

-- 2. Performance Indexes for Dashboard Stats
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created ON public.audit_logs(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_academic_resources_status_created ON public.academic_resources(status, created_at DESC);

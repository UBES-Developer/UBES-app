-- Audit Visualizer Schema

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- 'login', 'signup', 'grade_assignment', 'create_broadcast', 'create_booking', 'role_change', 'failed_login', etc.
    resource_type TEXT, -- 'assignment', 'broadcast', 'booking', 'user', etc.
    resource_id UUID, -- ID of the affected resource
    details JSONB, -- Additional context (e.g., old/new values, error messages)
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
    ON public.audit_logs 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- System can insert audit logs (we'll use service role for logging)
-- No RLS policy needed for INSERT since we'll use server-side logging

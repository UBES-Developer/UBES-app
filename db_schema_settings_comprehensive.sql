-- Phase 21: Settings Overhaul Schema

-- 1. Add granular notification preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_digest": true, "push_notifications": true, "class_announcements": true}'::jsonb;

-- 2. Add privacy settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "show_email": false, "show_phone": false}'::jsonb;

-- 3. Add 2FA enabled flag (simple flag for UI, though actual MFA requires Supabase Auth MFA setup)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

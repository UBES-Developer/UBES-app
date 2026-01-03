-- Settings & Preferences Schema

-- 1. Add Profile Fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"email_digest": true, "grade_alerts": true, "forum_replies": true}'::jsonb;

-- 2. Create Storage Bucket for Avatars (If not exists)
-- Note: This usually requires manual setup in Supabase Dashboard -> Storage
-- But we can try to insert into storage.buckets if we have permissions (rarely works from SQL editor without extensions)
-- Instead, we'll assume a 'avatars' bucket exists or instruct user to create one.

-- 3. RLS for Profiles (Update)
-- Ensure users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

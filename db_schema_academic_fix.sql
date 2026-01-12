-- Fix Forums FK to allow Profile Joins
-- Phase 13 Fix

-- Drop old FKs pointing to auth.users (which is not viewable via API usually)
ALTER TABLE public.forum_threads 
ADD CONSTRAINT forum_threads_author_id_fkey_profiles
FOREIGN KEY (author_id) REFERENCES public.profiles(id);

-- Depending on if the old constraint exists by name, we might want to drop it 
-- but adding a new one is usually enough if Supabase picks it up. 
-- However, strict SQL might complain about multiple FKs on same column? 
-- No, usually okay. But for clarity let's try to drop the default naming if specific.
-- Usually: forum_threads_author_id_fkey.

ALTER TABLE public.forum_threads 
DROP CONSTRAINT IF EXISTS forum_threads_author_id_fkey;

ALTER TABLE public.forum_posts 
DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;

ALTER TABLE public.forum_posts 
ADD CONSTRAINT forum_posts_author_id_fkey_profiles
FOREIGN KEY (author_id) REFERENCES public.profiles(id);

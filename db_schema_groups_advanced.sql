-- Groups Ecosystem Advanced Schema
-- Phase 11 & 13 Updates

-- 1. ENUMS
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- 2. TASKS (Kanban)
CREATE TABLE IF NOT EXISTS public.group_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. POSTS (Real-time Chat)
CREATE TABLE IF NOT EXISTS public.group_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RESOURCES (Files)
CREATE TABLE IF NOT EXISTS public.group_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path
    file_type TEXT,          -- 'pdf', 'docx'
    category TEXT,           -- 'Standards', 'Manuals'
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. UPDATE EXISTING GROUPS TABLE
ALTER TABLE public.student_groups 
ADD COLUMN IF NOT EXISTS current_project_name TEXT,
ADD COLUMN IF NOT EXISTS repo_link TEXT;

-- 6. RLS POLICIES

-- Tasks
ALTER TABLE public.group_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members view tasks" ON public.group_tasks FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_tasks.group_id 
    AND group_members.user_id = auth.uid()
));

CREATE POLICY "Group members create tasks" ON public.group_tasks FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_id 
    AND group_members.user_id = auth.uid()
));

CREATE POLICY "Group members update tasks" ON public.group_tasks FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_tasks.group_id 
    AND group_members.user_id = auth.uid()
));

-- Posts
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members view posts" ON public.group_posts FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_posts.group_id 
    AND group_members.user_id = auth.uid()
));

CREATE POLICY "Group members create posts" ON public.group_posts FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_id 
    AND group_members.user_id = auth.uid()
));

-- Resources
ALTER TABLE public.group_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members view resources" ON public.group_resources FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_resources.group_id 
    AND group_members.user_id = auth.uid()
));

CREATE POLICY "Group members upload resources" ON public.group_resources FOR INSERT
WITH CHECK (EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_members.group_id = group_id 
    AND group_members.user_id = auth.uid()
));

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_posts;

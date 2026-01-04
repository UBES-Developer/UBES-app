-- Advanced Groups Ecosystem Schema

-- 1. Group Tasks (Kanban)
CREATE TABLE IF NOT EXISTS public.group_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
    assigned_to UUID REFERENCES auth.users(id), -- Nullable for unassigned
    due_date TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Group Posts (Feed/Chat)
CREATE TABLE IF NOT EXISTS public.group_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Group Resources (Files)
CREATE TABLE IF NOT EXISTS public.group_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT, -- e.g., 'pdf', 'image', 'code'
    category TEXT DEFAULT 'General', -- e.g., 'Standards', 'Manuals'
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Modifying Existing Groups Table (Add new fields)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_groups' AND column_name = 'current_project') THEN
        ALTER TABLE public.student_groups ADD COLUMN current_project TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_groups' AND column_name = 'github_repo_url') THEN
        ALTER TABLE public.student_groups ADD COLUMN github_repo_url TEXT;
    END IF;
END $$;


-- RLS Policies

-- Tasks
ALTER TABLE public.group_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view tasks" ON public.group_tasks;
CREATE POLICY "Members view tasks" ON public.group_tasks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_tasks.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members create tasks" ON public.group_tasks;
CREATE POLICY "Members create tasks" ON public.group_tasks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_tasks.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members update tasks" ON public.group_tasks;
CREATE POLICY "Members update tasks" ON public.group_tasks FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_tasks.group_id AND user_id = auth.uid())
);

-- Posts
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view posts" ON public.group_posts;
CREATE POLICY "Members view posts" ON public.group_posts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members create posts" ON public.group_posts;
CREATE POLICY "Members create posts" ON public.group_posts FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_posts.group_id AND user_id = auth.uid())
);

-- Resources
ALTER TABLE public.group_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view resources" ON public.group_resources;
CREATE POLICY "Members view resources" ON public.group_resources FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_resources.group_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Members upload resources" ON public.group_resources;
CREATE POLICY "Members upload resources" ON public.group_resources FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_id = group_resources.group_id AND user_id = auth.uid())
);

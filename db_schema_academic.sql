-- Academic Content System Schema

-- 1. Academic Resources (Syllabi, E-books, Schedules)
CREATE TABLE IF NOT EXISTS public.academic_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('syllabus', 'ebook', 'schedule', 'lecture_note', 'other')),
    file_url TEXT, -- Link to uploaded file in Supabase Storage
    course_code TEXT,
    module TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Discussion Forums
CREATE TABLE IF NOT EXISTS public.forum_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT, -- e.g., 'General', 'Course Help', 'Projects'
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_academic_resources_type ON public.academic_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_academic_resources_module ON public.academic_resources(module);
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON public.forum_threads(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON public.forum_posts(thread_id);

-- RLS for Academic Resources
ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view academic resources" 
    ON public.academic_resources 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Lecturers and staff can upload resources" 
    ON public.academic_resources 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('lecturer', 'staff', 'admin')
        )
    );

-- RLS for Forums
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view threads" 
    ON public.forum_threads 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create threads" 
    ON public.forum_threads 
    FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Everyone can view posts" 
    ON public.forum_posts 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create posts" 
    ON public.forum_posts 
    FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

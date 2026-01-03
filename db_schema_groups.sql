-- Student Groups System Schema

-- 1. Student Groups (Societies, Clubs, Study Groups)
CREATE TABLE IF NOT EXISTS public.student_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('society', 'club', 'study_group')),
    description TEXT,
    image_url TEXT,
    fee_amount DECIMAL(10, 2) DEFAULT 0, -- 0 = Free
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Group Memberships
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.student_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    
    -- Status: 'free_trial' (default) or 'paid' (full access)
    membership_status TEXT DEFAULT 'free_trial' CHECK (membership_status IN ('free_trial', 'paid', 'expired')),
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'), -- 2 weeks trial default
    
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- RLS
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON public.student_groups;
CREATE POLICY "Public groups are viewable by everyone" ON public.student_groups FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users view own memberships" ON public.group_members;
CREATE POLICY "Users view own memberships" ON public.group_members FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users join groups" ON public.group_members;
CREATE POLICY "Users join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users leave groups" ON public.group_members;
CREATE POLICY "Users leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- Seed Data (Societies)
INSERT INTO public.student_groups (name, type, description, fee_amount, image_url) VALUES 
('Engineering Student Council', 'society', 'The voice of engineering students.', 150.00, 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60'),
('Robotics Club', 'club', 'Building the future, one bot at a time.', 200.00, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60'),
('Chess Society', 'club', 'Strategy and critical thinking.', 50.00, 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=60'),
('Debating Union', 'society', 'Foster public speaking and argumentation.', 100.00, 'https://images.unsplash.com/photo-1475721027767-4d0937d50e24?w=800&auto=format&fit=crop&q=60'),
('Architecture Collective', 'study_group', 'Peer support for architecture projects.', 0, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop&q=60')
ON CONFLICT DO NOTHING;

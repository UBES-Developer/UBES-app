-- Storage Bucket for Assignments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignments', 'assignments', false)
ON CONFLICT (id) DO NOTHING;

-- Policies

-- 1. Student can upload to their own folder (by user ID)
CREATE POLICY "Student upload submission" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'assignments' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 2. Student can view their own files
CREATE POLICY "Student view own submission" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'assignments' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 3. Staff can view all files
CREATE POLICY "Staff view all submissions" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'assignments' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('lecturer', 'staff', 'admin')
));

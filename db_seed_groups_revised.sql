-- Revised Groups Seed Script
-- WARNING: This will wipe all existing groups and memberships!

TRUNCATE TABLE public.group_members, public.student_groups RESTART IDENTITY CASCADE;

INSERT INTO public.student_groups (name, type, description, fee_amount, image_url) VALUES 
-- UBES Groups (Societies/Chapters)
('UBES Civil', 'society', 'The Civil Engineering chapter of UBES. Building foundations for the future.', 100.00, 'https://images.unsplash.com/photo-1590644365607-1c5a2e97a39e?w=800&auto=format&fit=crop&q=60'),
('UBES Mechanical', 'society', 'The Mechanical Engineering chapter. Gears, thermodynamics, and innovation.', 100.00, 'https://images.unsplash.com/photo-1537462713205-e512d5b4d084?w=800&auto=format&fit=crop&q=60'),
('UBES Electrical', 'society', 'Powering the world. The Electrical Engineering student body.', 100.00, 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&auto=format&fit=crop&q=60'),
('UBES Electronics', 'society', 'Circuits, signals, and systems. The Electronics division.', 100.00, 'https://images.unsplash.com/photo-1555664424-778a69022365?w=800&auto=format&fit=crop&q=60'),
('UBES Architecture', 'society', 'Designing tomorrow. The Architecture student collective.', 120.00, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&auto=format&fit=crop&q=60'),
('UBES Urban Planning', 'society', 'Shaping cities and communities. Urban Planning student group.', 100.00, 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=60'),
('UBES Industrial Design', 'society', 'Form meets function. Industrial Design student chapter.', 110.00, 'https://images.unsplash.com/photo-1581093458791-9f302e6d8c2c?w=800&auto=format&fit=crop&q=60'),
('UBES Geomatics', 'society', 'Mapping the world. Geomatics and Surveying group.', 100.00, 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60'),

-- UBIEA
('UBIEA', 'society', 'University Board of Industrial Engineers & Associates. Optimizing everything.', 150.00, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60'),

-- Metallurgy Maven
('Metallurgy Maven', 'club', 'Material science enthusiasts and metalworking experts.', 50.00, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60');

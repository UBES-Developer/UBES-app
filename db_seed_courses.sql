-- Course Seed Data
-- Source: plan/list_of_courses.md

-- Clear existing courses to avoid duplicates during seed (Optional, or using ON CONFLICT)
-- TRUNCATE public.courses CASCADE; -- Commented out for safety

INSERT INTO public.courses (code, name, description, credits, semester, faculty)
VALUES

-- 1. ARCHITECTURE & PLANNING (Faculty: Built Environment)

-- Bachelor of Architecture
('ARB111', 'Design Communication I', 'Foundations of architectural representation.', 4, 'Semester 1', 'Built Environment'),
('ARB121', 'Design Communication II', 'Advanced architectural representation.', 4, 'Semester 2', 'Built Environment'),
('ARB112', 'Building Materials & Construction I', 'Introduction to construction materials.', 3, 'Semester 1', 'Built Environment'),
('ARB122', 'Building Materials & Construction II', 'Advanced construction techniques.', 3, 'Semester 2', 'Built Environment'),
('ARB113', 'Traditional African Architecture', 'Study of indigenous architectural forms.', 3, 'Semester 1', 'Built Environment'),
('ARB123', 'History of Art', 'Survey of art history relevant to architecture.', 3, 'Semester 2', 'Built Environment'),
('ARB124', 'Environment and Comfort', 'Principles of environmental design.', 3, 'Semester 2', 'Built Environment'),

('ARB211', 'Architectural Design I', 'Design studio: residential scale.', 5, 'Semester 1', 'Built Environment'),
('ARB221', 'Architectural Design II', 'Design studio: public scale.', 5, 'Semester 2', 'Built Environment'),
('ARB212', 'Building Materials & Construction III', 'Complex material systems.', 3, 'Semester 1', 'Built Environment'),
('ARB222', 'Building Materials & Construction IV', 'Integration of systems.', 3, 'Semester 2', 'Built Environment'),
('ARB213', 'History of Architecture I', 'Ancient to Classical periods.', 3, 'Semester 1', 'Built Environment'),
('ARB223', 'History of Architecture II', 'Medieval to Renaissance.', 3, 'Semester 2', 'Built Environment'),
('ARB214', 'Energy Efficiency in Buildings', 'Sustainable design strategies.', 3, 'Semester 1', 'Built Environment'),
('ARB216', 'Computer Aided Drafting', 'CAD software proficiency.', 3, 'Semester 1', 'Built Environment'),

-- Bachelor of Urban & Regional Planning
('URP110', 'Introduction to Planning', 'Overview of planning profession.', 3, 'Semester 1', 'Built Environment'),
('URP111', 'History of Planning', 'Evolution of cities and planning.', 3, 'Semester 1', 'Built Environment'),
('URP220', 'Planning Theory I', 'Foundational planning theories.', 3, 'Semester 1', 'Built Environment'),
('URP224', 'Planning Theory II', 'Advanced planning theories.', 3, 'Semester 2', 'Built Environment'),
('URP221', 'Planning Graphics', 'Visual communication for planners.', 3, 'Semester 1', 'Built Environment'),
('URP222', 'Planning Methods & Techniques', 'Quantitative and qualitative methods.', 3, 'Semester 1', 'Built Environment'),
('URP223', 'Site Planning and Design I', 'Site analysis and layout.', 4, 'Semester 1', 'Built Environment'),
('URP225', 'GIS for Planners', 'Geographic Information Systems application.', 3, 'Semester 1', 'Built Environment'),

-- Bachelor of Real Estate
('RES101', 'Introduction to Real Estate', 'Basics of property market.', 3, 'Semester 1', 'Built Environment'),
('RES102', 'Introduction to Valuation', 'Principles of property valuation.', 3, 'Semester 1', 'Built Environment'),
('RES200', 'Land Economics I', 'Economic principles of land use.', 3, 'Semester 1', 'Built Environment'),
('RES210', 'Land Economics II', 'Advanced land economics.', 3, 'Semester 2', 'Built Environment'),
('RES201', 'Principles and Methods of Valuation', 'Valuation methodologies.', 3, 'Semester 1', 'Built Environment'),

-- 2. CIVIL & MINING ENGINEERING (Faculty: Engineering)

-- Common Level 200 Engineering
('MMB231', 'Engineering & Computer Aided Drawing', 'Technical drawing and CAD.', 3, 'Semester 1', 'Engineering'),
('CCB231', 'Materials Science for Engineers', 'Properties of engineering materials.', 3, 'Semester 1', 'Engineering'),
('CCB232', 'Engineering Mechanics: Statics', 'Forces and equilibrium.', 3, 'Semester 1', 'Engineering'),
('EEB231', 'Electrical Principles I', 'Circuit theory basics.', 3, 'Semester 1', 'Engineering'),
('EEB241', 'Electrical Principles II', 'AC circuits and systems.', 3, 'Semester 2', 'Engineering'),
('IBC201', 'Workshop Technology', 'Practical workshop skills.', 3, 'Semester 1', 'Engineering'),
('MMB241', 'Dynamics of Particles', 'Kinematics and kinetics.', 3, 'Semester 2', 'Engineering'),
('CCB241', 'Mechanics of Materials', 'Stress, strain, and deformation.', 3, 'Semester 2', 'Engineering'),
('MAT291', 'Engineering Mathematics I', 'Calculus and Algebra.', 4, 'Semester 1', 'Engineering'),
('MAT292', 'Engineering Mathematics II', 'Differential Equations.', 4, 'Semester 2', 'Engineering'),

-- Civil Engineering
('CCB313', 'Surveying', 'Land surveying techniques.', 3, 'Semester 1', 'Engineering'),
('CCB331', 'Analysis of Structures', 'Structural analysis methods.', 4, 'Semester 1', 'Engineering'),
('CCB332', 'Materials in Construction', 'Concrete, steel, and composites.', 3, 'Semester 1', 'Engineering'),
('CCB333', 'Fluid Mechanics for Civil', 'Fluid statics and dynamics.', 3, 'Semester 1', 'Engineering'),
('CCB334', 'Geology for Civil Engineers', 'Geological principles.', 3, 'Semester 1', 'Engineering'),
('CCB341', 'Reinforced Concrete Design', 'Design of RC structures.', 4, 'Semester 2', 'Engineering'),
('CCB342', 'Soil Mechanics', 'Soil properties and behavior.', 4, 'Semester 2', 'Engineering'),
('CCB343', 'Hydraulics', 'Open channel flow.', 3, 'Semester 2', 'Engineering'),

-- Mining Engineering
('MIN211', 'Introduction to Mining', 'Overview of mining industry.', 3, 'Semester 1', 'Engineering'),
('MIN313', 'Introduction to Mineral Processing', 'Processing ores and minerals.', 3, 'Semester 1', 'Engineering'),
('MIN316', 'Mining and the Environment', 'Environmental impact of mining.', 3, 'Semester 1', 'Engineering'),
('MIN325', 'Mine Supervision', 'Management in mining context.', 3, 'Semester 2', 'Engineering'),
('MIN326', 'Mine Surveying', 'Underground and surface surveying.', 3, 'Semester 2', 'Engineering'),
('MIN412', 'Rock Mechanics', 'Rock behavior under stress.', 4, 'Semester 1', 'Engineering'),

-- 3. ELECTRICAL & MECHANICAL ENGINEERING (Faculty: Engineering)

-- Electrical
('EEB331', 'Electrical Network Theory', 'Advanced circuit analysis.', 3, 'Semester 1', 'Engineering'),
('EEB332', 'Analogue Electronic Fundamentals', 'Diodes, transistors, amplifiers.', 3, 'Semester 1', 'Engineering'),
('EEB333', 'Electrical Measurements', 'Measurement systems.', 3, 'Semester 1', 'Engineering'),
('EEB334', 'Computer Programming I', 'Introduction to C/C++.', 3, 'Semester 1', 'Engineering'),
('MAT391', 'Engineering Mathematics III', 'Advanced Calculus.', 4, 'Semester 1', 'Engineering'),
('EEB341', 'Digital Electronics', 'Logic gates and circuits.', 3, 'Semester 2', 'Engineering'),
('EEB342', 'Electromagnetics', 'Maxwell equations and fields.', 3, 'Semester 2', 'Engineering'),
('EEB343', 'Electrical Engineering Design', 'Design project.', 3, 'Semester 2', 'Engineering'),
('EEB344', 'Basic Electrical Machines', 'Motors and generators.', 3, 'Semester 2', 'Engineering'),
('MAT392', 'Engineering Mathematics IV', 'Complex Analysis.', 4, 'Semester 2', 'Engineering'),
('EEB431', 'Control Systems', 'Feedback control systems.', 4, 'Semester 1', 'Engineering'),
('EEB451', 'Power Electronics', 'Power conversion circuits.', 4, 'Semester 1', 'Engineering'),

-- Mechanical
('MMB311', 'Solid Mechanics', 'Stress analysis.', 3, 'Semester 1', 'Engineering'),
('MMB312', 'Materials Science II', 'Phase diagrams and heat treatment.', 3, 'Semester 1', 'Engineering'),
('MMB313', 'Mechanics of Machines', 'Kinematics of mechanisms.', 3, 'Semester 1', 'Engineering'),
('MMB321', 'Thermodynamics I', 'Laws of thermodynamics.', 3, 'Semester 2', 'Engineering'),
('MMB322', 'Fluid Mechanics I', 'Fluid flow principles.', 3, 'Semester 2', 'Engineering'),
('MMB323', 'Machine Design I', 'Design of machine elements.', 4, 'Semester 2', 'Engineering'),
('MMB324', 'Manufacturing Technology I', 'Machining and casting.', 3, 'Semester 2', 'Engineering'),

-- 4. INDUSTRIAL DESIGN (Faculty: Design)
('IBC110', 'Design Fundamentals', 'Core design principles.', 3, 'Semester 1', 'Industrial Design'),
('IBC111', 'Elements & Principles of Design', 'Visual design elements.', 3, 'Semester 1', 'Industrial Design'),
('IBC120', 'Design Materials & Processes', 'Materials for design.', 3, 'Semester 2', 'Industrial Design'),
('IBC121', 'Graphical Communication I', 'Drawing for designers.', 3, 'Semester 2', 'Industrial Design'),
('IBC211', 'Design for Sustainability', 'Eco-friendly design.', 3, 'Semester 1', 'Industrial Design'),
('IBC212', 'Product Design Studios: Electronics', 'Design of electronic products.', 4, 'Semester 1', 'Industrial Design')

ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    credits = EXCLUDED.credits,
    semester = EXCLUDED.semester,
    faculty = EXCLUDED.faculty;

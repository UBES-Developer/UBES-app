-- Seed Data for Diverse Engineering Facilities (Requested: 10 Classrooms, 4 Computer Labs, 20 Labs)

-- Clean up existing (Optional: remove this if you want to append)
-- DELETE FROM public.lab_resources;

-- 1. Specialized Engineering Labs (20 Items)
INSERT INTO public.lab_resources (name, type, location, capacity, description) VALUES
('Solid Mechanics Lab', 'lab', 'Building A, Room 101', 30, 'Stress and strain analysis.'),
('Fluid Dynamics Lab', 'lab', 'Building A, Room 102', 25, 'Flow visualization and wind tunnels.'),
('Thermodynamics Lab', 'lab', 'Building E, Room 201', 30, 'Heat transfer and engine testing.'),
('Materials Science Lab', 'lab', 'Building M, Room 105', 20, 'Microscopy and tensile testing.'),
('High Voltage Lab', 'lab', 'Building E, Basement', 15, 'Insulation and breakdown testing.'),
('Power Electronics Lab', 'lab', 'Building E, Room 304', 25, 'Inverters and drive systems.'),
('Control Systems Lab', 'lab', 'Building E, Room 205', 20, 'PLC and PID controller tuning.'),
('Robotics & Automation Lab', 'lab', 'Building R, Room 101', 25, 'Robot arms and mechatronics.'),
('Telecommunications Lab', 'lab', 'Building E, Room 401', 20, 'Signal processing and antennas.'),
('RF & Microwave Lab', 'lab', 'Building E, Room 402', 10, 'Faraday cage and spectrum analysis.'),
('Geotechnical Lab', 'lab', 'Building C, Basement', 20, 'Soil mechanics and foundation testing.'),
('Environmental Eng Lab', 'lab', 'Building C, Room 101', 25, 'Water quality and waste treatment.'),
('Hydraulics Lab', 'lab', 'Building C, Room 102', 30, 'Open channel flow and pumps.'),
('Structural Engineering Lab', 'lab', 'Building C, Hangar', 50, 'Large scale beam and frame testing.'),
('Concrete Testing Lab', 'lab', 'Building C, Basement', 15, 'Curing tanks and compression testing.'),
('Transportation Lab', 'lab', 'Building C, Room 201', 20, 'Traffic simulation and pavement design.'),
('Combustion Lab', 'lab', 'Building A, Room B01', 10, 'Fuel analysis and flame propagation.'),
('Heat Transfer Lab', 'lab', 'Building A, Room 202', 25, 'Conduction, convection, radiation units.'),
('Renewable Energy Lab', 'lab', 'Building E, Roof', 15, 'Solar PV and wind turbine systems.'),
('Bio-Medical Engineering Lab', 'lab', 'Building B, Room 301', 20, 'Tissue engineering and prosthetics.');

-- 2. Computer Labs (4 Items)
INSERT INTO public.lab_resources (name, type, location, capacity, description) VALUES
('CAD/CAM Studio', 'lab', 'Building D, Room 201', 40, 'High-spec workstations for SolidWorks/AutoCAD.'),
('Simulation Hub', 'lab', 'Building D, Room 202', 30, 'ANSYS and COMSOL simulation cluster.'),
('Software Engineering Lab', 'lab', 'Building I, Room 305', 50, 'Linux terminals and dev environments.'),
('Cyber Security Range', 'lab', 'Building I, Room 404', 20, 'Isolated network for pen-testing.');

-- 3. Classrooms & Theatres (10 Items)
INSERT INTO public.lab_resources (name, type, location, capacity, description) VALUES
('Lecture Theatre A', 'room', 'Main Building, L1', 200, 'Tiered seating, dual projectors.'),
('Lecture Theatre B', 'room', 'Main Building, L2', 150, 'Tiered seating, AV equipped.'),
('Seminar Room 101', 'room', 'Building L, L1', 30, 'Flexible seating for discussion.'),
('Seminar Room 102', 'room', 'Building L, L1', 30, 'Flexible seating for discussion.'),
('Tutorial Room 2A', 'room', 'Building L, L2', 25, 'Whiteboard walls, group tables.'),
('Tutorial Room 2B', 'room', 'Building L, L2', 25, 'Whiteboard walls, group tables.'),
('Design Studio 1', 'room', 'Building D, L1', 40, 'Open plan, drafting tables.'),
('Design Studio 2', 'room', 'Building D, L1', 40, 'Open plan, maker space access.'),
('Project Room Alpha', 'room', 'Library, L3', 10, 'Quiet study and group work.'),
('Project Room Beta', 'room', 'Library, L3', 10, 'Quiet study and group work.');

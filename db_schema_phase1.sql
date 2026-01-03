-- Phase 1: Student Portal Schema

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    module TEXT NOT NULL, -- e.g., 'Thermodynamics', 'Calculus II'
    deadline TIMESTAMPTZ NOT NULL,
    difficulty_score INTEGER CHECK (difficulty_score >= 1 AND difficulty_score <= 10), -- 1 (Easy) to 10 (Hard)
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own assignments" 
    ON assignments FOR ALL 
    USING (auth.uid() = student_id);

-- Kanban Boards (Design Hub)
CREATE TABLE IF NOT EXISTS kanban_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Kanban Columns
CREATE TABLE IF NOT EXISTS kanban_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id UUID REFERENCES kanban_boards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INTEGER NOT NULL, -- To order columns (e.g., 0, 1, 2)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Kanban Cards
CREATE TABLE IF NOT EXISTS kanban_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID REFERENCES kanban_columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL, -- To order cards within a column
    assignee_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Kanban (Simplified: Public for now, or Team based later)
-- For Phase 1, we'll allow Authenticated users to view/edit for simplicity until "Teams" are implemented.
ALTER TABLE kanban_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_cards ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to create/read boards (Collaborative Hub)
CREATE POLICY "Authenticated users can access boards"
    ON kanban_boards FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can access columns"
    ON kanban_columns FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can access cards"
    ON kanban_cards FOR ALL
    TO authenticated
    USING (true);

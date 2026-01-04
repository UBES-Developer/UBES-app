-- Seed Data for Assignment Templates

INSERT INTO public.assignment_templates (title, department, description, grading_criteria, settings)
VALUES
(
    'Standard Lab Report',
    'General Engineering',
    'A structured report detailing experimental procedure, results, and analysis.',
    '{
        "criteria": [
            {"name": "Abstract & Introduction", "weight": 10, "prompt": "Does the abstract summarize the experiment? Is the hypothesis clear?"},
            {"name": "Methodology", "weight": 20, "prompt": "Are the steps reproducible? Is safety addressed?"},
            {"name": "Data Analysis", "weight": 40, "prompt": "Are calculations correct? Are graphs labeled units included?"},
            {"name": "Conclusion & Discussion", "weight": 30, "prompt": "Is the result explained in context of theory? Sources cited?"}
        ]
    }'::jsonb,
    '{
        "allow_drafts": true,
        "require_integrity_pledge": true,
        "file_types": [".pdf", ".docx"]
    }'::jsonb
),
(
    'Research Essay',
    'Humanities & Social Sciences',
    'A critical analysis paper based on scholarly sources.',
    '{
        "criteria": [
            {"name": "Thesis Statement", "weight": 15, "prompt": "Is the argument clear and debatable?"},
            {"name": "Evidence & Analysis", "weight": 45, "prompt": "Are claims supported by data/citations? Is the reasoning logical?"},
            {"name": "Organization", "weight": 20, "prompt": "Do paragraphs flow logically? Are transitions smooth?"},
            {"name": "Grammar & Style", "weight": 20, "prompt": "Is the tone academic? Are there mechanical errors?"}
        ]
    }'::jsonb,
    '{
        "allow_drafts": true,
        "require_integrity_pledge": true,
        "word_count_min": 1500
    }'::jsonb
),
(
    'Weekly Problem Set',
    'Mathematics & Physics',
    'Set of calculation-based problems to demonstrate concept mastery.',
    '{
        "criteria": [
            {"name": "Correctness", "weight": 60, "prompt": "Are the final answers correct?"},
            {"name": "Workings Shown", "weight": 30, "prompt": "Is the derivation clear? Are steps skipped?"},
            {"name": "Neatness", "weight": 10, "prompt": "Is the handwriting/formatting legible?"}
        ]
    }'::jsonb,
    '{
        "allow_drafts": false,
        "require_integrity_pledge": true
    }'::jsonb
);

'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getUpcomingAssignments() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    // Fetch assignments where status is not completed, sorted by deadline
    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .neq('status', 'completed')
        .gte('deadline', new Date().toISOString()) // Future deadlines only? Or include overdue?
        .order('deadline', { ascending: true })
        .limit(5);

    if (error) {
        console.error('Error fetching assignments:', error);
        return [];
    }

    return data;
}

export async function getPriorityAssignments() {
    // AI Prioritization Logic: (Deadline * Weight) / Difficulty
    // For now, we fetch all pending and sort effectively.
    // In a real app, this logic might be more complex or use a Python endpoint.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
        .from('assignments')
        .select('*')
        .neq('status', 'completed');

    if (!data) return [];

    // Sort by "Urgency Score"
    // Heuristic: Close deadline = High Score. High Difficulty = High Score (need to start early).
    // Score = 1 / (HoursUntilDeadline) * Difficulty
    // We'll simplistic sort for now

    return data.sort((a, b) => {
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        const now = Date.now();

        // Calculate hours remaining (negative if overdue)
        const hoursA = (dateA - now) / 36e5;
        const hoursB = (dateB - now) / 36e5;

        // Function to calculate score
        const getScore = (hours: number, difficulty: number) => {
            // Base capability: difficulty (1-10)
            const base = difficulty || 5;

            // 1. Overdue: Immediate highest priority
            if (hours < 0) {
                // The more overdue, the more critical (up to a point), then maybe lost cause?
                // Let's say: Overdue is always > 1000 score.
                return 1000 + (Math.abs(hours) * 10) + base;
            }

            // 2. Upcoming (< 24h): Critical
            if (hours < 24) {
                // Score 100-1000 range
                // As hours -> 0, score -> higher
                return 500 + ((24 - hours) * 10) + base;
            }

            // 3. Future (> 24h): Standard planning
            // Score 0-100 range
            // Decay score as time increases
            return (1000 / (hours + 24)) * base;
        };

        const scoreA = getScore(hoursA, a.difficulty_score || 5);
        const scoreB = getScore(hoursB, b.difficulty_score || 5);

        return scoreB - scoreA; // Descending order (High score first)
    });
}

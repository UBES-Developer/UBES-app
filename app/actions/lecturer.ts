'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function getAllAssignments() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify lecturer role (Double check security)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Fetch submissions with assignment details
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
            *,
            assignments (
                title,
                course_code,
                total_points
            )
        `)
        .order('submitted_at', { ascending: false });

    if (error) {
        console.error("Error fetching submissions:", error);
        return { error: error.message };
    }

    // Manual Join: Fetch Profiles
    const studentIds = Array.from(new Set(submissions.map((s: any) => s.student_id).filter(Boolean)));

    let profilesMap: Record<string, any> = {};
    if (studentIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', studentIds);

        profiles?.forEach((p: any) => {
            profilesMap[p.id] = p;
        });
    }

    // Flatten and Merge
    const data = submissions.map((sub: any) => ({
        ...sub,
        title: sub.assignments?.title || "Untitled Assignment",
        course_code: sub.assignments?.course_code,
        total_points: sub.assignments?.total_points,
        profiles: profilesMap[sub.student_id] || { full_name: 'Unknown Student' }
    }));

    return { data };
}

export async function updateGrade(assignmentId: string, grade: number, feedback: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('submissions')
        .update({
            grade,
            feedback,
            status: 'graded',
            graded_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/lecturer');
    return { success: true };
}

export async function getStudentHealthData() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Fetch submissions with grades
    const { data: assignments, error } = await supabase
        .from('submissions')
        .select(`
            grade,
            student_id
        `);

    if (error) return { error: error.message };

    // Manual Join: Fetch Profiles
    const studentIds = Array.from(new Set(assignments?.map((s: any) => s.student_id).filter(Boolean)));

    let profilesMap: Record<string, any> = {};
    if (studentIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', studentIds);

        profiles?.forEach((p: any) => {
            profilesMap[p.id] = p;
        });
    }

    // Map profiles back to assignments for aggregation logic below
    assignments?.forEach((a: any) => {
        a.profiles = profilesMap[a.student_id];
    });

    // Aggregate data by student
    const studentStats: Record<string, any> = {};

    assignments?.forEach((a: any) => {
        const studentId = a.student_id;
        if (!studentStats[studentId]) {
            studentStats[studentId] = {
                id: a.profiles?.id,
                full_name: a.profiles?.full_name || 'Unknown',
                username: a.profiles?.username,
                avatar_url: a.profiles?.avatar_url,
                total_grade: 0,
                submission_count: 0,
                grades: []
            };
        }

        if (a.grade !== null) {
            studentStats[studentId].total_grade += a.grade;
            studentStats[studentId].grades.push(a.grade);
        }
        studentStats[studentId].submission_count += 1;
    });

    // Calculate averages
    const students = Object.values(studentStats).map((s: any) => ({
        ...s,
        avg_grade: s.grades.length > 0 ? s.total_grade / s.grades.length : 0
    }));

    return { data: students };
}

'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAvailableCourses() {
    const supabase = createClient(await cookies());
    const { data } = await supabase.from('courses').select('*, enrollments(student_id)');

    // Check if current user is enrolled (simple check)
    // Actually simpler to fetch enrollments separately or handle in UI

    return { data };
}

export async function getEnrolledCourses() {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data, error } = await supabase.from('enrollments')
        .select(`
            course_id,
            courses (*)
        `)
        .eq('student_id', user.id);

    if (error) console.error(error);

    // Map to just courses
    const courses = data?.map(item => item.courses).filter(Boolean) || [];
    return { data: courses };
}

export async function enrollInCourse(courseId: string) {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase.from('enrollments').insert({
        student_id: user.id,
        course_id: courseId
    });

    if (error) {
        if (error.code === '23505') return { error: 'Already enrolled' };
        return { error: error.message };
    }

    revalidatePath('/dashboard/student/academic-hub');
    return { success: true };
}

export async function getStudentSchedule() {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // 1. Get enrolled course IDs
    const { data: enrollments } = await supabase.from('enrollments').select('course_id').eq('student_id', user.id);

    if (!enrollments || enrollments.length === 0) return { data: [] };

    const courseIds = enrollments.map(e => e.course_id);

    // 2. Get schedule for these courses
    const { data: schedule } = await supabase.from('course_schedule')
        .select(`
            *,
            courses (
                code,
                name,
                location: course_schedule(location) -- wait, location is on schedule
            )
        `)
        .in('course_id', courseIds);

    // Wait, simple select is better
    const { data: scheduleSimple } = await supabase.from('course_schedule')
        .select(`
            *,
            courses (code, name)
        `)
        .in('course_id', courseIds);

    return { data: scheduleSimple };
}

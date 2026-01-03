'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function searchStaff(query: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Search by full_name, department, or position
    // We only want lecturers or staff
    const { data: staff, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department, position, role')
        .in('role', ['lecturer', 'staff'])
        .or(`full_name.ilike.%${query}%,department.ilike.%${query}%,position.ilike.%${query}%`)
        .limit(10);

    if (error) {
        console.error("Search error:", error);
        return [];
    }

    return staff;
}

export async function requestConsultation(staffId: string, startTime: string, reason: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const start = new Date(startTime);
    // Assume 30 min duration for now, or could be passed
    const end = new Date(start.getTime() + 30 * 60000);
    const endTimeIso = end.toISOString();

    // 1. Check Availability (Conflict Detection)
    // A. Check if Staff has a CLASS (attendance_session)
    const { data: classConflict } = await supabase
        .from('attendance_sessions')
        .select('id, module_code')
        .eq('lecturer_id', staffId)
        .lte('start_time', endTimeIso)
        .gte('end_time', startTime);

    if (classConflict && classConflict.length > 0) {
        throw new Error(`Staff member has a class (${classConflict[0].module_code}) at this time.`);
    }

    // B. Check if Staff has another CONSULTATION (approved)
    const { data: consultationConflict } = await supabase
        .from('consultations')
        .select('id')
        .eq('staff_id', staffId)
        .eq('status', 'approved')
        .lte('start_time', endTimeIso)
        .gte('end_time', startTime);

    if (consultationConflict && consultationConflict.length > 0) {
        throw new Error("Staff member has another consultation booked at this time.");
    }

    // 2. Create Request
    const { error } = await supabase.from('consultations').insert({
        student_id: user.id,
        staff_id: staffId,
        start_time: startTime,
        end_time: endTimeIso,
        reason,
        status: 'pending'
    });

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/student');
}

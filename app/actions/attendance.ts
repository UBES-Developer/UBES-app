'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAttendanceHistory() {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // Get all scans for this student
    const { data: scans } = await supabase
        .from('attendance_scans')
        .select(`
            *,
            attendance_sessions (
                module_code,
                session_date,
                start_time
            )
        `)
        .eq('student_id', user.id)
        .order('scanned_at', { ascending: false });

    return { data: scans };
}

export async function getActiveSessions() {
    const supabase = createClient(await cookies());
    // In real app, might filter by course enrollment
    const { data } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('is_active', true)
        .gt('end_time', new Date().toISOString()); // Only valid ones

    return { data };
}

export async function selfCheckIn(sessionId: string, lat?: number, lng?: number) {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // 1. Verify Session
    const { data: session } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (!session) return { error: "Session not found" };

    // 2. Verify Geolocation (Simple Distance Check)
    if (session.location_lat && session.location_lng) {
        if (!lat || !lng) return { error: "Location required for this session" };

        const distance = getDistanceFromLatLonInM(lat, lng, session.location_lat, session.location_lng);
        if (distance > (session.radius_meters || 100)) {
            return { error: `You are too far from the class (${Math.round(distance)}m). Must be within ${session.radius_meters}m.` };
        }
    }

    // 3. Mark Present
    const { error } = await supabase.from('attendance_scans').insert({
        session_id: sessionId,
        student_id: user.id,
        status: 'present',
        location_lat: lat,
        location_lng: lng
    });

    if (error) {
        if (error.code === '23505') return { error: "Already checked in" };
        return { error: error.message };
    }

    revalidatePath('/dashboard/student/attendance');
    return { success: true };
}

export async function submitDispute(sessionId: string, reason: string) {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase.from('attendance_disputes').insert({
        session_id: sessionId,
        student_id: user.id,
        reason: reason
    });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/student/attendance');
    return { success: true };
}

// Utility: Haversine Formula
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // meters
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

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

// LECTURER: Start Attendance
export async function createOTPSession(moduleCode: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Generate 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

    const { data, error } = await supabase
        .from('attendance_sessions')
        .insert({
            lecturer_id: user.id,
            module_code: moduleCode,
            otp_code: otpCode,
            otp_expires_at: expiresAt,
            is_active: true,
            start_time: new Date().toISOString()
        })
        .select()
        .single();

    if (error) return { error: error.message };
    
    revalidatePath('/dashboard/staff/attendance');
    return { success: true, code: otpCode, expiresAt };
}

// STUDENT: Enter Code
export async function submitOTP(code: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // 1. Find Session
    const { data: session, error: sessionError } = await supabase
        .from('attendance_sessions')
        .select('id, module_code')
        .eq('otp_code', code)
        .gt('otp_expires_at', new Date().toISOString()) // Must be valid
        .single();

    if (sessionError || !session) {
        return { error: "Invalid or expired code." };
    }

    // 2. Mark Present
    const { error: scanError } = await supabase
        .from('attendance_scans')
        .insert({
            session_id: session.id,
            student_id: user.id,
            status: 'present',
            scanned_at: new Date().toISOString()
        });

    if (scanError) {
        if (scanError.code === '23505') return { error: "You have already checked in for this session." };
        return { error: scanError.message };
    }

    revalidatePath('/dashboard/student/attendance');
    return { success: true, module: session.module_code };
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

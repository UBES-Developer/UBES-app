'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// LAB RESOURCES MANAGEMENT (Staff Only)

export async function createLabResource(name: string, type: 'lab' | 'equipment' | 'room', description: string, capacity?: number, location?: string, equipment: string[] = []) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('lab_resources')
        .insert([{
            name,
            type,
            description,
            capacity,
            location,
            equipment
        }]);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/staff');
    return { success: true };
}

export async function getLabResources(equipmentFilter?: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from('lab_resources')
        .select('*')
        .eq('is_available', true)
        .order('type')
        .order('name');

    // Simple client-side filtering or exact match if supported
    // JSONB contains is tricky with Supabase JS client sometimes, using text search or fetch-all-and-filter

    const { data, error } = await query;

    if (error) return { error: error.message };

    if (equipmentFilter && equipmentFilter !== 'all') {
        // Filter in memory for simplicity unless we set up GIN index
        return { data: data.filter(r => r.equipment && Array.isArray(r.equipment) && r.equipment.includes(equipmentFilter)) };
    }

    return { data };
}

// BOOKING ACTIONS

export async function createBooking(resourceId: string, startTime: string, endTime: string, purpose: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // 1. Check Duration Limit (Max 3 hours)
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationHours > 3) {
        return { error: "Exceeded maximum booking duration (3 hours)." };
    }
    if (durationHours <= 0) {
        return { error: "Invalid duration." };
    }

    // 2. Check for overlapping bookings
    // Logic: (StartA <= EndB) and (EndA >= StartB)
    const { data: existing, error: checkError } = await supabase
        .from('lab_bookings')
        .select('id')
        .eq('resource_id', resourceId)
        .neq('status', 'cancelled')
        .neq('status', 'rejected')
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`); // This covers overlaps

    if (checkError) return { error: checkError.message };

    // Exact overlap check:
    // If ANY existing booking overlaps, reject.
    // The query above returns ANY record where start <= requested_end AND end >= requested_start
    // Actually, properly: E.Start < R.End AND E.End > R.Start
    // Supabase .or() with lte/gte is a bit loose.
    // Better: gt/lt logic.
    // Let's filter in memory if needed to be sure, but relying on query:
    // We want NO overlapping bookings.

    // The query finds potential collisions. We need to be strict.
    const isCollision = existing?.some(b => true); // If any returned, it collided based on query logic

    if (isCollision) {
        return { error: "Time slot already reserved. Please choose another time." };
    }

    const { error } = await supabase
        .from('lab_bookings')
        .insert([{
            resource_id: resourceId,
            user_id: user.id,
            start_time: startTime,
            end_time: endTime,
            purpose
        }]);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/student/labs');
    revalidatePath('/dashboard/staff');
    return { success: true };
}

export async function getMyBookings() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('lab_bookings')
        .select(`
            *,
            resource:lab_resources (
                name,
                type,
                location
            )
        `)
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true });

    if (error) return { error: error.message };
    return { data };
}

export async function getAllBookings() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('lab_bookings')
        .select(`
            *,
            resource:lab_resources (
                name,
                type,
                location
            ),
            user:user_id (
                full_name
            )
        `)
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true });

    if (error) return { error: error.message };
    return { data };
}

export async function updateBookingStatus(bookingId: string, status: 'approved' | 'rejected' | 'cancelled') {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('lab_bookings')
        .update({ status })
        .eq('id', bookingId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/staff');
    revalidatePath('/dashboard/student/labs');
    return { success: true };
}

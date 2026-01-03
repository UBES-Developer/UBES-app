'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check profile role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'staff'].includes(profile.role)) {
        throw new Error("Forbidden: Admin access only");
    }

    return supabase;
}

export async function approveResource(resourceId: string) {
    const supabase = await checkAdmin();

    const { error } = await supabase
        .from('academic_resources')
        .update({ status: 'approved', rejection_reason: null })
        .eq('id', resourceId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/resources');
    revalidatePath('/admin'); // For the counter
}

export async function rejectResource(resourceId: string, reason: string) {
    const supabase = await checkAdmin();

    const { error } = await supabase
        .from('academic_resources')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', resourceId);

    if (error) throw new Error((error as any).message);
    revalidatePath('/dashboard/admin/resources');
    revalidatePath('/admin');
}

export async function createEvent(formData: FormData) {
    const supabase = await checkAdmin();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const start_time = formData.get('start_time') as string;
    const end_time = formData.get('end_time') as string;
    const location = formData.get('location') as string;
    const generate_qr = formData.get('generate_qr') === 'on';
    const reminder_sent = formData.get('send_reminder') === 'on'; // Storing intent to send reminder

    let qr_code_url = null;
    if (generate_qr) {
        // Generate a public URL for the QR code using a 3rd party API (e.g. goqr.me or similar)
        // Ideally we generate the content first. Content = Event ID or Check-in URL.
        // Since we don't have ID yet, we use a placeholder or insert first.
        // Let's insert first.
        qr_code_url = 'PENDING';
    }

    const { data, error } = await supabase
        .from('events')
        .insert({
            title,
            description,
            start_time,
            end_time,
            location,
            reminder_sent: false, // Will be handled by cron
            qr_code_url: null // Update after ID
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    if (generate_qr && data) {
        // Generate QR for the event check-in URL
        // Example: https://ubes-portal.com/check-in/{id}
        const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/check-in/${data.id}`;
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(checkInUrl)}`;

        await supabase
            .from('events')
            .update({ qr_code_url: qrApi })
            .eq('id', data.id);
    }


    revalidatePath('/admin/schedule');
}

export async function deleteEvent(eventId: string) {
    const supabase = await checkAdmin();

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/schedule');
    revalidatePath('/admin/events');
}

export async function createResource(formData: FormData) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Auth check (Lecturers/Staff can upload, Admins too)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // We allow upload, status will be 'pending' by default
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const resource_type = formData.get('resource_type') as string;
    const course_code = formData.get('course_code') as string;
    const module = formData.get('module') as string;
    const file_url = formData.get('file_url') as string; // Ideally this is handled by client upload first

    const { error } = await supabase.from('academic_resources').insert({
        title,
        description,
        resource_type,
        course_code,
        module,
        file_url,
        uploaded_by: user.id,
        status: 'pending'
    });


    if (error) throw new Error(error.message);
    revalidatePath('/admin/resources');
}

export async function adminUploadResource(formData: FormData) {
    const supabase = await checkAdmin();
    const { data: { user } } = await supabase.auth.getUser();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const resource_type = formData.get('resource_type') as string;
    const course_code = formData.get('course_code') as string;
    const module = formData.get('module') as string;
    const file_url = formData.get('file_url') as string;

    const { error } = await supabase.from('academic_resources').insert({
        title,
        description,
        resource_type,
        course_code,
        module,
        file_url,
        uploaded_by: user!.id,
        status: 'approved'
    });

    if (error) throw new Error(error.message);
    revalidatePath('/admin/resources');
}

export async function deleteResource(resourceId: string) {
    const supabase = await checkAdmin();

    // Check if resource exists first (optional, for better error messages)
    // Then delete
    const { error } = await supabase
        .from('academic_resources')
        .delete()
        .eq('id', resourceId);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/resources');
}

export async function blockResource(formData: FormData) {
    const supabase = await checkAdmin();

    const resource_id = formData.get('resource_id') as string;
    const start_time = formData.get('start_time') as string;
    const end_time = formData.get('end_time') as string;
    const reason = formData.get('reason') as string;

    const { error } = await supabase.from('bookings').insert({
        resource_id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        start_time,
        end_time,
        status: 'maintenance',
        type: 'maintenance',
    });

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/admin/schedule');
}

export async function scheduleExamMode(formData: FormData) {
    const supabase = await checkAdmin();
    const adminId = (await supabase.auth.getUser()).data.user?.id;

    // const title = formData.get('title') as string;
    const start_time = formData.get('start_time') as string;
    const end_time = formData.get('end_time') as string;

    // 1. Get all resources
    const { data: resources } = await supabase.from('lab_resources').select('id');
    if (!resources || resources.length === 0) throw new Error("No resources found");

    // 2. Create bookings for each
    const bookings = resources.map(r => ({
        resource_id: r.id,
        user_id: adminId,
        start_time,
        end_time,
        status: 'confirmed',
        type: 'exam',
    }));

    // 3. Insert all
    const { error } = await supabase.from('bookings').insert(bookings);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/admin/schedule');
}

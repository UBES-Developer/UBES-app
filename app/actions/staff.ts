'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function createBroadcast(title: string, message: string, priority: string, targetGroup: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('broadcasts')
        .insert([{
            title,
            message,
            priority,
            target_group: targetGroup,
            author_id: user.id
        }]);

    if (error) return { error: error.message };

    // Revalidate all potential dashboards
    revalidatePath('/dashboard/staff');
    revalidatePath('/dashboard/student');
    revalidatePath('/dashboard/lecturer');
    return { success: true };
}

export async function getBroadcasts() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch all for staff view
    const { data, error } = await supabase
        .from('broadcasts')
        .select(`
            *,
            author:author_id (
                full_name,
                role
            )
        `)
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

export async function getActiveBroadcastsForUser() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get user role to filter
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    // We can't easily get the role inside the query builder without a second query or complex join
    // So we rely on the RLS we set up! The RLS `USING` clause already filters rows.
    // So we just SELECT * and Supabase filters for us. Nice.

    const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3); // Just top 3 recent

    if (error) return { error: error.message };
    return { data };
}

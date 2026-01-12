'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical' | 'success';
    created_at: string;
    is_read?: boolean; // For future user-specific read state
}

export async function getNotifications() {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { notifications: [] };

    // Get user profile for role-based filtering
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role || 'student';

    // Fetch active notifications targeting 'all' or specific role
    const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('is_active', true)
        .or(`target_role.eq.all,target_role.eq.${role}`)
        .gt('expires_at', new Date().toISOString()) // Only future expiry
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching notifications:", error);
        return { notifications: [] };
    }

    return { notifications: data as Notification[] };
}

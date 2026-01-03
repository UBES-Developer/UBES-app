'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getAuditLogs(filters?: {
    actionType?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: "Admin access required" };
    }

    let query = supabase
        .from('audit_logs')
        .select(`
            *,
            user:user_id (
                full_name,
                username,
                role
            )
        `)
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

    if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
    }

    if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
    }

    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data };
}

export async function getAuditStats() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get counts by action type for the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
        .from('audit_logs')
        .select('action_type')
        .gte('created_at', yesterday.toISOString());

    if (error) return { error: error.message };

    // Count by action type
    const stats = data?.reduce((acc: Record<string, number>, log: any) => {
        acc[log.action_type] = (acc[log.action_type] || 0) + 1;
        return acc;
    }, {});

    return { data: stats };
}

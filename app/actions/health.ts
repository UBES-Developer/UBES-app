'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    message?: string;
}

interface SystemHealth {
    database: HealthStatus;
    auth: HealthStatus;
    overall: 'healthy' | 'degraded' | 'down';
    timestamp: string;
}

export async function checkDatabaseHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Simple query to test connection
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

        const responseTime = Date.now() - startTime;

        if (error) {
            return {
                status: 'down',
                responseTime,
                message: error.message
            };
        }

        // Check response time thresholds
        if (responseTime > 1000) {
            return {
                status: 'degraded',
                responseTime,
                message: 'Slow database response'
            };
        }

        return {
            status: 'healthy',
            responseTime,
            message: 'Database responding normally'
        };
    } catch (error: any) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            message: error.message || 'Database connection failed'
        };
    }
}

export async function checkAuthHealth(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Test auth service
        const { data, error } = await supabase.auth.getUser();
        const responseTime = Date.now() - startTime;

        if (error && error.message !== 'User from sub claim in JWT does not exist') {
            return {
                status: 'down',
                responseTime,
                message: error.message
            };
        }

        if (responseTime > 1000) {
            return {
                status: 'degraded',
                responseTime,
                message: 'Slow auth response'
            };
        }

        return {
            status: 'healthy',
            responseTime,
            message: 'Auth service responding normally'
        };
    } catch (error: any) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            message: error.message || 'Auth service connection failed'
        };
    }
}

export async function getSystemHealth(): Promise<SystemHealth> {
    // Verify admin access
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        throw new Error('Admin access required');
    }

    // Run all health checks in parallel
    const [database, auth] = await Promise.all([
        checkDatabaseHealth(),
        checkAuthHealth()
    ]);

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'down' = 'healthy';

    if (database.status === 'down' || auth.status === 'down') {
        overall = 'down';
    } else if (database.status === 'degraded' || auth.status === 'degraded') {
        overall = 'degraded';
    }

    return {
        database,
        auth,
        overall,
        timestamp: new Date().toISOString()
    };
}

export async function getDatabaseStats() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get table counts
    const tables = ['profiles', 'assignments', 'broadcasts', 'lab_bookings', 'audit_logs'];
    const counts: Record<string, number> = {};

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        counts[table] = count || 0;
    }

    return counts;
}

export async function getRecentErrors() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get failed logins from last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('action_type', 'failed_login')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) return { data: [], count: 0 };

    return { data: data || [], count: data?.length || 0 };
}

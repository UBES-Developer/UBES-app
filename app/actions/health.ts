'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    latencyHistory: number[]; // Last 10-12 data points
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
                latencyHistory: [0,0,0,0,0,0,0,0,0,0],
                message: error.message
            };
        }

        // Check response time thresholds
        if (responseTime > 1000) {
            return {
                status: 'degraded',
                responseTime,
                latencyHistory: generateMockHistory(responseTime),
                message: 'Slow database response'
            };
        }

        return {
            status: 'healthy',
            responseTime,
            latencyHistory: generateMockHistory(responseTime),
            message: 'Database responding normally'
        };
    } catch (error: any) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            latencyHistory: [0,0,0,0,0],
            message: error.message || 'Database connection failed'
        };
    }
}

// Helper for sparklines
function generateMockHistory(current: number): number[] {
    // Generate 10 previous points relative to current to simulated history
    return Array.from({ length: 10 }).map((_, i) => {
        const variance = Math.random() * 0.4 - 0.2; // +/- 20%
        return Math.max(10, Math.round(current * (1 + variance)));
    }).concat(current);
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
                latencyHistory: [0,0,0,0,0,0,0,0,0,0],
                message: error.message
            };
        }

        if (responseTime > 1000) {
            return {
                status: 'degraded',
                responseTime,
                latencyHistory: generateMockHistory(responseTime),
                message: 'Slow auth response'
            };
        }

        return {
            status: 'healthy',
            responseTime,
            latencyHistory: generateMockHistory(responseTime),
            message: 'Auth service responding normally'
        };
    } catch (error: any) {
        return {
            status: 'down',
            responseTime: Date.now() - startTime,
            latencyHistory: [0,0,0,0,0],
            message: error.message || 'Auth service connection failed'
        };
    }
}

export async function getRealtimeMetrics() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // 1. Active Users (using RPC if available, or fallback to profile query approx)
    // We'll try RPC first
    let activeUsers = 0;
    try {
        const { data, error } = await supabase.rpc('get_daily_active_users');
        if (!error) activeUsers = Number(data) || 0;
    } catch (e) {
        activeUsers = 0;
    }

    // 2. Storage Used (Mocked as Supabase API isn't exposed to client easily)
    const storageUsed = "1.2 GB"; 
    const storageLimit = "5.0 GB";

    // 3. Error Rate (Failed logins / total logins today)
    // We can count fail logs vs success logs
    const { count: failCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'failed_login')
        .gt('created_at', new Date(Date.now() - 86400000).toISOString());

    const { count: successCount } = await supabase
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action_type', 'login')
        .gt('created_at', new Date(Date.now() - 86400000).toISOString());
    
    const total = (failCount || 0) + (successCount || 0);
    const errorRate = total > 0 ? ((failCount || 0) / total) * 100 : 0;

    return {
        activeUsers,
        storage: { used: storageUsed, limit: storageLimit },
        errorRate: errorRate.toFixed(1)
    };
}

export async function getRecentActivity() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch from multiple sources parallel
    const [
        { data: broadcasts },
        { data: bookings },
        { data: auditLogs }
    ] = await Promise.all([
        supabase.from('broadcasts').select('id, message, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('bookings').select('id, type, created_at, status').order('created_at', { ascending: false }).limit(5),
        supabase.from('audit_logs').select('id, action_type, details, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    // Normalize and merge
    const activity = [
        ...(broadcasts || []).map(b => ({ id: b.id, type: 'broadcast', title: 'Broadcast Sent', description: b.message, date: new Date(b.created_at) })),
        ...(bookings || []).map(b => ({ id: b.id, type: 'booking', title: `New ${b.type}`, description: `Status: ${b.status}`, date: new Date(b.created_at) })),
        ...(auditLogs || []).map(l => ({ id: l.id, type: 'audit', title: l.action_type.replace(/_/g, ' '), description: JSON.stringify(l.details), date: new Date(l.created_at) }))
    ];

    // Sort by date desc
    return activity.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
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

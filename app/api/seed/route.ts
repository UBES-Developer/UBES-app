import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const users = [
        { email: 'student_test@ubes.com', password: 'password123', role: 'student', full_name: 'Test Student' },
        { email: 'lecturer_test@ubes.com', password: 'password123', role: 'lecturer', full_name: 'Test Lecturer' },
        { email: 'staff_test@ubes.com', password: 'password123', role: 'staff', full_name: 'Test Staff' },
        { email: 'admin_test@ubes.com', password: 'password123', role: 'admin', full_name: 'Test Admin' },
    ];

    const results = [];

    // Strategy 1: Admin API (needs Service Key)
    if (serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

        for (const u of users) {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { role: u.role, full_name: u.full_name, username: u.full_name.replace(' ', '_').toLowerCase() }
            });

            if (authError) {
                results.push({ email: u.email, strategy: 'admin', status: 'failed', error: authError.message });
                continue;
            }

            // Profile creation... (same as before, assuming trigger handles it or we upsert)
            // ...
            results.push({ email: u.email, strategy: 'admin', status: 'success' });
        }
    }
    // Strategy 2: Client API (Fallback)
    else {
        // We must create a new client for EACH user to avoid session collisions/persistence issues
        for (const u of users) {
            const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } });

            const { data, error } = await supabase.auth.signUp({
                email: u.email,
                password: u.password,
                options: {
                    data: {
                        role: u.role,
                        full_name: u.full_name,
                        username: u.full_name.replace(' ', '_').toLowerCase()
                    }
                }
            });

            if (error) {
                results.push({ email: u.email, strategy: 'anon', status: 'failed', error: error.message });
            } else if (data.session) {
                results.push({ email: u.email, strategy: 'anon', status: 'success_active', note: 'Email confirmation is OFF' });
            } else if (data.user && !data.session) {
                results.push({ email: u.email, strategy: 'anon', status: 'success_pending', note: 'Email confirmation is ON. Please disable it in Supabase dashboard.' });
            }
        }
    }

    return NextResponse.json({ results });
}

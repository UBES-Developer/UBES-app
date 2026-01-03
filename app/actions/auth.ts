'use server';

import { createClient } from "@/lib/supabase/server";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";

export async function forgotPassword(formData: FormData) {
    const email = formData.get('email') as string;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const origin = (await headers()).get('origin');

    if (!email) {
        return { error: "Email is required" };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: "Check your email for a password reset link." };
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        await logAudit('failed_login', undefined, undefined, { email, error: error.message });
        return { error: error.message };
    }

    await logAudit('login', 'user', data.user?.id, { email }, data.user?.id);

    // Check if MFA is enabled
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
        redirect('/auth/verify-mfa');
    }

    // Fetch user role for redirection
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const role = profile?.role;

        if (role === 'admin') {
            redirect('/admin');
        } else if (role === 'student') {
            redirect('/dashboard/student');
        } else if (role === 'lecturer') {
            redirect('/dashboard/lecturer');
        } else if (role === 'staff') {
            redirect('/dashboard/staff');
        }
    }

    redirect('/');
}

export async function signup(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const student_id = formData.get('student_id') as string;
    const role = formData.get('role') as string || 'student'; // Default to student if not provided
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const origin = (await headers()).get('origin');

    if (!username || username.length < 3) {
        return { error: "Username must be at least 3 characters" };
    }

    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                username,
                student_id: student_id || null,
                role: role, // Include role in metadata
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    return { success: "Check your email to confirm your account." };
}

export async function signOut() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    redirect('/login');
}

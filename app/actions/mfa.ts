'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import QRCode from 'qrcode';

// Alias for backward compatibility
export const getMFAStatus = checkMFAStatus;

export async function checkMFAStatus() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "User not found" };

    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) return { error: error.message };

    const enabled = data.all.some(factor => factor.status === 'verified');
    return { enabled, factors: data.all };
}

export async function enrollMFA() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
    });

    if (error) return { error: error.message };

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(data.totp.uri);

    return {
        id: data.id,
        qrCode,
        secret: data.totp.secret
    };
}

// Alias for backward compatibility or strict naming
export const verifyAndEnableMFA = verifyMFA;

export async function verifyMFA(factorId: string, code: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
    });

    if (error) return { error: error.message };

    return { success: true };
}

export async function unenrollMFA(factorId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.mfa.unenroll({
        factorId,
    });

    if (error) return { error: error.message };

    return { success: true };
}

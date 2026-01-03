'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const fullName = formData.get("full_name") as string;
    const bio = formData.get("bio") as string;
    const phone = formData.get("phone") as string;
    // Avatar handling would go here (upload to storage, get URL)

    // For now, simpler JSON update
    const updates = {
        full_name: fullName,
        bio,
        phone,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/student"); // Update greeting
    return { success: true };
}

export async function updatePreferences(preferences: any) {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from("profiles")
        .update({ preferences })
        .eq("id", user.id);

    if (error) return { error: error.message };

    revalidatePath("/dashboard/settings");
    return { success: true };
}

export async function getProfile() {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: null };

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return { data };
}

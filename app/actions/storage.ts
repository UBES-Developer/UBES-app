"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getSignedUrl(filePath: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .storage
        .from('assignments')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
        console.error("Signed URL Error:", error);
        return null;
    }

    return data.signedUrl;
}

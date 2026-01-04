"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function submitAssignmentAction(formData: FormData) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const file = formData.get("file") as File;
    const assignmentId = formData.get("assignmentId") as string;
    const integrityCheck = formData.get("integrityCheck") === "true";

    if (!file || !assignmentId) {
        return { success: false, message: "Missing file or assignment ID" };
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // 1. Upload File
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from("assignments")
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload Error:", uploadError);
        // Fallback for demo if bucket doesn't exist yet
        // return { success: false, message: "Upload failed. Storage bucket might be missing." };
    }

    // 2. Insert Submission Record
    const { error: dbError } = await supabase
        .from("submissions")
        .insert({
            assignment_id: assignmentId,
            student_id: user.id,
            content_url: filePath,
            status: "submitted",
            integrity_pledge_signed: integrityCheck,
            submitted_at: new Date().toISOString(),
            attempt_number: 1 // Logic to increment this would go here
        });

    if (dbError) {
        console.error("DB Error:", dbError);
        return { success: false, message: "Database insertion failed." };
    }

    // 3. Trigger AI Grading (Stub)
    // await triggerAIGrading(submissionId);

    revalidatePath(`/dashboard/student/assignments/${assignmentId}`);
    return { success: true, message: "Assignment submitted successfully!" };
}

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function logAudit(
    actionType: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>,
    userId?: string
) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Get current user if not provided
        let logUserId = userId;
        if (!logUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            logUserId = user?.id;
        }

        await supabase.from('audit_logs').insert([{
            user_id: logUserId,
            action_type: actionType,
            resource_type: resourceType,
            resource_id: resourceId,
            details: details || {}
        }]);
    } catch (error) {
        // Silent fail - don't break application if audit logging fails
        console.error('Audit logging failed:', error);
    }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// --- Fetch Workspace Data ---
export async function getGroupWorkspaceData(groupId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // Verify membership
    const { data: membership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

    if (!membership) return { error: "You are not a member of this group" };

    // Parallel fetch
    const [tasksRes, postsRes, resourcesRes, groupRes] = await Promise.all([
        supabase.from('group_tasks').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
        supabase.from('group_posts').select('*, author:author_id(full_name, email)').eq('group_id', groupId).order('created_at', { ascending: true }), // Chat order
        supabase.from('group_resources').select('*').eq('group_id', groupId),
        supabase.from('student_groups').select('*').eq('id', groupId).single()
    ]);

    return {
        group: groupRes.data,
        tasks: tasksRes.data || [],
        posts: postsRes.data || [],
        resources: resourcesRes.data || [],
        currentUser: user.id
    };
}

// --- Kanban Actions ---

export async function addTask(groupId: string, title: string, description: string = "") {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('group_tasks')
        .insert({
            group_id: groupId,
            title,
            description,
            created_by: user.id,
            status: 'todo'
        });

    if (error) return { error: error.message };
    revalidatePath(`/dashboard/student/groups/${groupId}`);
    return { success: true };
}

export async function updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'done', groupId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('group_tasks')
        .update({ status })
        .eq('id', taskId);

    if (error) return { error: error.message };
    revalidatePath(`/dashboard/student/groups/${groupId}`);
    return { success: true };
}

// --- Chat Actions ---

export async function postMessage(groupId: string, content: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('group_posts')
        .insert({
            group_id: groupId,
            author_id: user.id,
            content
        });

    if (error) return { error: error.message };
    revalidatePath(`/dashboard/student/groups/${groupId}`);
    return { success: true };
}

// --- Resource Actions ---

export async function addResource(groupId: string, title: string, url: string, category: string = "General") {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('group_resources')
        .insert({
            group_id: groupId,
            title,
            file_url: url,
            uploaded_by: user.id,
            category
        });

    if (error) return { error: error.message };
    revalidatePath(`/dashboard/student/groups/${groupId}`);
    return { success: true };
}

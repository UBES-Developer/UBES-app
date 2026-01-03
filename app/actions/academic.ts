'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ACADEMIC RESOURCES

export async function getAcademicResources(filter?: { type?: string; module?: string }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from('academic_resources')
        .select(`
            *,
            uploader:uploaded_by (
                full_name,
                username
            )
        `)
        .order('created_at', { ascending: false });

    if (filter?.type) {
        query = query.eq('resource_type', filter.type);
    }

    if (filter?.module) {
        query = query.eq('module', filter.module);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data };
}

export async function uploadAcademicResource(
    title: string,
    description: string,
    resourceType: string,
    fileUrl: string,
    courseCode?: string,
    module?: string
) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('academic_resources')
        .insert([{
            title,
            description,
            resource_type: resourceType,
            file_url: fileUrl,
            course_code: courseCode,
            module,
            uploaded_by: user.id
        }]);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/student/academic-hub');
    return { success: true };
}

// DISCUSSION FORUMS

export async function getForumThreads(category?: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let query = supabase
        .from('forum_threads')
        .select(`
            *,
            author:author_id (
                full_name,
                username,
                avatar_url
            ),
            posts:forum_posts (count)
        `)
        .order('updated_at', { ascending: false });

    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { data };
}

export async function getThreadPosts(threadId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
        .from('forum_posts')
        .select(`
            *,
            author:author_id (
                full_name,
                username,
                avatar_url
            )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    if (error) return { error: error.message };
    return { data };
}

export async function createThread(title: string, category: string, initialPost: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Create thread
    const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .insert([{
            title,
            category,
            author_id: user.id
        }])
        .select()
        .single();

    if (threadError) return { error: threadError.message };

    // Create first post
    const { error: postError } = await supabase
        .from('forum_posts')
        .insert([{
            thread_id: thread.id,
            author_id: user.id,
            content: initialPost
        }]);

    if (postError) return { error: postError.message };

    revalidatePath('/dashboard/student/forums');
    return { success: true, threadId: thread.id };
}

export async function createPost(threadId: string, content: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('forum_posts')
        .insert([{
            thread_id: threadId,
            author_id: user.id,
            content
        }]);

    if (error) return { error: error.message };

    // Update thread updated_at
    await supabase
        .from('forum_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

    revalidatePath(`/dashboard/student/forums/${threadId}`);
    return { success: true };
}

// GRADE TRANSCRIPT

export async function getStudentTranscript() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('student_id', user.id)
        .not('grade', 'is', null)
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

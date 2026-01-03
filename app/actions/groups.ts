'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAvailableGroups() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch all public groups
    const { data: allGroups, error } = await supabase
        .from('student_groups')
        .select('*')
        .eq('is_public', true);

    if (error) return { error: error.message };
    if (!user) return { data: allGroups }; // If not logged in, show all

    // Fetch my memberships to filter out
    const { data: memberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

    const myGroupIds = memberships?.map(m => m.group_id) || [];

    // Filter logic: Return groups I am NOT a member of
    const available = allGroups.filter(g => !myGroupIds.includes(g.id));
    return { data: available };
}

export async function getMyGroups() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { data: [] };

    const { data, error } = await supabase
        .from('group_members')
        .select(`
            *,
            group:student_groups (*)
        `)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    return { data };
}

export async function joinGroup(groupId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from('group_members')
        .insert([{
            group_id: groupId,
            user_id: user.id,
            membership_status: 'free_trial' // Default to trial
        }]);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/student/groups');
    return { success: true };
}

export async function leaveGroup(groupId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/student/groups');
    return { success: true };
}

export async function upgradeMembership(groupId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // In a real app, this would integrate with Stripe/Payment Gateway
    // Here we simulate successful payment

    const { error } = await supabase
        .from('group_members')
        .update({ membership_status: 'paid' })
        .eq('group_id', groupId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/student/groups');
    return { success: true };
}

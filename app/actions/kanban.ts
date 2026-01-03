'use server';

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getKanbanData() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    // 1. Get the user's board (or create one if none exists)
    let { data: board } = await supabase
        .from('kanban_boards')
        .select('*')
        .eq('owner_id', user.id)
        .single();

    if (!board) {
        // Create default board
        const { data: newBoard, error: createError } = await supabase
            .from('kanban_boards')
            .insert([{ title: 'My Project', owner_id: user.id }])
            .select() // Ensure we return the data
            .single();

        if (createError) {
            console.error("Board creation error:", createError);
            return { error: "Failed to create board" };
        }
        board = newBoard;

        // Create default columns
        const columns = [
            { board_id: board.id, title: 'To Do', position: 0 },
            { board_id: board.id, title: 'In Progress', position: 1 },
            { board_id: board.id, title: 'Done', position: 2 }
        ];

        const { error: colError } = await supabase.from('kanban_columns').insert(columns);
        if (colError) console.error("Column creation error:", colError);
    }

    // 2. Get columns
    const { data: columns } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('board_id', board.id)
        .order('position');

    // 3. Get tasks
    const { data: tasks } = await supabase
        .from('kanban_tasks')
        .select('*')
        .in('column_id', columns?.map(c => c.id) || [])
        .order('position');

    return { board, columns, tasks };
}

export async function moveTask(taskId: string, newColumnId: string, newPosition: number) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('kanban_tasks')
        .update({ column_id: newColumnId, position: newPosition })
        .eq('id', taskId);

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/student/design');
}

export async function createTask(columnId: string, content: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('kanban_tasks')
        .insert([{
            column_id: columnId,
            content,
            position: 999
        }]); // We'll fix order with drag and drop or db trigger later

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/student/design');
}

export async function deleteTask(taskId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/student/design');
}

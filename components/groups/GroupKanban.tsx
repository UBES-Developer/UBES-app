"use client"

import { useState } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { KanbanColumn } from "@/components/kanban/KanbanColumn"
import { Task } from "@/components/kanban/types"
import { updateTaskStatus } from "@/app/actions/group-workspace"
import { toast } from "sonner"

interface GroupKanbanProps {
    groupId: string
    initialTasks: any[]
}

export function GroupKanban({ groupId, initialTasks }: GroupKanbanProps) {
    // Map DB tasks to Dnd Tasks
    const [tasks, setTasks] = useState<Task[]>(initialTasks.map(t => ({
        id: t.id,
        content: t.title,
        column_id: t.status,
        position: 0 // Not strictly enforcing sort order in DB yet
    })))

    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const columns = [
        { id: 'todo', title: 'To Do' },
        { id: 'in_progress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
    ]

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    function handleDragOver(event: DragOverEvent) {
        // Simplified for this implementation
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find status
        let newStatus = overId;
        // If dropped on a task, find that task's column
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            newStatus = overTask.column_id;
        }

        // Validate status
        if (!['todo', 'in_progress', 'done'].includes(newStatus)) return;

        // Update local
        setTasks(prev => prev.map(t =>
            t.id === activeId ? { ...t, column_id: newStatus } : t
        ));

        // Update Server
        const res = await updateTaskStatus(activeId, newStatus as any, groupId);
        if (res.error) toast.error("Failed to move task");

        setActiveId(null);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {columns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={tasks.filter(t => t.column_id === col.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-indigo-500 opacity-90 cursor-grabbing">
                        {tasks.find(t => t.id === activeId)?.content}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanItem } from '@/components/kanban/KanbanItem';
import { Task } from '@/components/kanban/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTask } from '@/app/actions/kanban';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    id: string;
    title: string;
    tasks: Task[];
};

export function KanbanColumn({ id, title, tasks }: Props) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    const [open, setOpen] = React.useState(false);
    const [newTaskContent, setNewTaskContent] = React.useState("");

    async function handleAddTask() {
        if (newTaskContent) {
            await createTask(id, newTaskContent);
            setNewTaskContent("");
            setOpen(false);
        }
    }

    return (
        <div className="flex h-full w-80 min-w-[20rem] flex-col rounded-xl bg-gray-100/50 border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50 rounded-t-xl backdrop-blur-sm">
                <h3 className="font-semibold text-gray-700">{title}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                    {tasks.length}
                </span>
            </div>

            <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                <SortableContext
                    id={id}
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <KanbanItem key={task.id} id={task.id} task={task} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-400">
                        Drop items here
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-white/30 rounded-b-xl">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Label>Task Description</Label>
                            <Input
                                value={newTaskContent}
                                onChange={(e) => setNewTaskContent(e.target.value)}
                                placeholder="Enter task details..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTask}>Create Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

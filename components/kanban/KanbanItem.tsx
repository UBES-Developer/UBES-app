'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './types';
import { GripVertical, X } from 'lucide-react';
import { deleteTask } from '@/app/actions/kanban';

type Props = {
    id: string;
    task: Task;
};

export function KanbanItem({ id, task }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-start gap-2 rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 cursor-grab active:cursor-grabbing ${isDragging ? 'z-50' : ''}`}
            {...attributes}
            {...listeners}
        >
            <GripVertical className="mt-0.5 h-4 w-4 text-gray-300 group-hover:text-gray-500" />
            <p className="flex-1 text-sm font-medium text-gray-700">{task.content}</p>

            <button
                onClick={(e) => {
                    e.stopPropagation(); // prevent drag start
                    if (confirm('Delete task?')) deleteTask(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
            >
                <X className="h-3 w-3" />
            </button>
        </div>
    );
}

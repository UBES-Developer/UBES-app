'use client';

import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { useState } from "react";

interface DeleteButtonProps {
    id: string;
    action: (id: string) => Promise<any>;
}

export function DeleteButton({ id, action }: DeleteButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            await action(id);
        } catch (error) {
            console.error(error);
            alert("Failed to delete item.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="hover:bg-red-50"
        >
            <Trash2 className={`h-4 w-4 text-red-500 ${isLoading ? 'opacity-50' : ''}`} />
        </Button>
    );
}

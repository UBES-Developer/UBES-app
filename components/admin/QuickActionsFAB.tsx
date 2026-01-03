'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, CheckCircle, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export function QuickActionsFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleAction = (action: string) => {
        setIsOpen(false);
        switch (action) {
            case 'broadcast':
                toast.info("Broadcast feature coming soon!");
                break;
            case 'approve_all':
                // Call server action to approve all (mocked for UI)
                toast.success("All resources approved!");
                break;
            case 'create_event':
                router.push('/admin/events/create');
                break;
        }
    };

    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
            {isOpen && (
                <>
                    <Button
                        variant="secondary"
                        className="shadow-lg flex items-center gap-2 pr-4 bg-white hover:bg-slate-50 border border-slate-200"
                        onClick={() => handleAction('broadcast')}
                    >
                        <Megaphone className="h-4 w-4 text-amber-500" /> Broadcast Alert
                    </Button>
                    <Button
                        variant="secondary"
                        className="shadow-lg flex items-center gap-2 pr-4 bg-white hover:bg-slate-50 border border-slate-200"
                        onClick={() => handleAction('approve_all')}
                    >
                        <CheckCircle className="h-4 w-4 text-green-500" /> Approve All Resources
                    </Button>
                    <Button
                        variant="secondary"
                        className="shadow-lg flex items-center gap-2 pr-4 bg-white hover:bg-slate-50 border border-slate-200"
                        onClick={() => handleAction('create_event')}
                    >
                        <Calendar className="h-4 w-4 text-indigo-500" /> Create Event
                    </Button>
                </>
            )}

            <Button
                size="icon"
                className={`h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 transition-transform ${isOpen ? 'rotate-45' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Plus className="h-6 w-6 text-white" />
            </Button>
        </div>
    );
}

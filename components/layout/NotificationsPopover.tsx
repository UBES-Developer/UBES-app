'use client';

import { useEffect, useState } from "react";
import { getNotifications, Notification } from "@/app/actions/notifications";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Info, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch on mount and when opened
    useEffect(() => {
        const fetchNotes = async () => {
            const { notifications: data } = await getNotifications();
            setNotifications(data || []);
            // Simple logic: assume all fetched are "unread" for this session to show badge
            // In a real app, we'd track 'read' status in DB.
            setUnreadCount(data?.length || 0);
        };
        fetchNotes();
        
        // Optional: Poll every minute
        const interval = setInterval(fetchNotes, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            // Clear badge on open
            setUnreadCount(0); 
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'critical': return <ShieldAlert className="h-4 w-4 text-red-500" />;
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} New</Badge>}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((note) => (
                                <div key={note.id} className="p-3 hover:bg-slate-50 transition-colors">
                                    <div className="flex gap-3 items-start">
                                        <div className="mt-0.5 min-w-[20px]">
                                            {getIcon(note.type)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none text-slate-800">
                                                {note.title}
                                            </p>
                                            <p className="text-xs text-slate-500 leading-snug">
                                                {note.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 pt-1">
                                                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}

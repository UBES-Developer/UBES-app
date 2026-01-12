'use client';

import { 
    ScrollArea 
} from "@/components/ui/scroll-area";
import { 
    AlertCircle, 
    Calendar, 
    Radio, 
    ShieldAlert, 
    FileText 
} from "lucide-react";

interface ActivityItem {
    id: string;
    type: 'broadcast' | 'booking' | 'audit';
    title: string;
    description: string;
    date: Date;
}

const iconMap = {
    broadcast: Radio,
    booking: Calendar,
    audit: FileText
};

const colorMap = {
    broadcast: "bg-blue-100 text-blue-600",
    booking: "bg-green-100 text-green-600",
    audit: "bg-slate-100 text-slate-600"
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed h-full min-h-[200px]">
                <ShieldAlert className="w-8 h-8 mb-2 opacity-50" />
                <p>No recent system activity</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
                {items.map((item) => {
                    const Icon = iconMap[item.type] || FileText;
                    const colorClass = colorMap[item.type] || colorMap.audit;

                    return (
                        <div key={item.id} className="flex gap-4 p-3 rounded-lg border bg-white/50 hover:bg-white transition-colors">
                            <div className={`p-2 rounded-lg h-fit ${colorClass}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-sm text-slate-900 capitalize truncate">
                                        {item.title}
                                    </p>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                        {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}

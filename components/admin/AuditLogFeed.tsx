'use client';

import { Activity, User, Shield, AlertCircle, FileText, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditLog {
    id: string;
    action_type: string;
    details: any;
    created_at: string;
}

export function AuditLogFeed({ logs }: { logs: AuditLog[] }) {
    if (!logs || logs.length === 0) {
        return <div className="text-center text-slate-400 py-8 text-sm">No recent activity</div>;
    }

    const getIcon = (action: string) => {
        if (action.includes('login')) return <User className="h-4 w-4 text-emerald-500" />;
        if (action.includes('fail')) return <AlertCircle className="h-4 w-4 text-red-500" />;
        if (action.includes('broadcast')) return <Globe className="h-4 w-4 text-blue-500" />;
        if (action.includes('resource')) return <FileText className="h-4 w-4 text-purple-500" />;
        return <Activity className="h-4 w-4 text-slate-400" />;
    };

    return (
        <div className="space-y-4">
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="mt-1 p-1.5 bg-slate-100 rounded-full">
                        {getIcon(log.action_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                            {formatAction(log.action_type)}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                            {JSON.stringify(log.details || {}).slice(0, 50)}
                        </p>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatAction(action: string) {
    return action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

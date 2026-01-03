'use client';

import { useState, useEffect } from "react";
import { getAuditLogs, getAuditStats } from "@/app/actions/audit";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, User, Shield, AlertCircle, CheckCircle, Info, FileText, Filter } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
    login: "bg-green-500/20 text-green-700 border-green-300",
    signup: "bg-blue-500/20 text-blue-700 border-blue-300",
    failed_login: "bg-red-500/20 text-red-700 border-red-300",
    grade_assignment: "bg-purple-500/20 text-purple-700 border-purple-300",
    create_broadcast: "bg-orange-500/20 text-orange-700 border-orange-300",
    default: "bg-gray-500/20 text-gray-700 border-gray-300"
};

export default function AuditVisualizerPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [filter, setFilter] = useState({ actionType: '', startDate: '', endDate: '' });
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const [logsData, statsData] = await Promise.all([
            getAuditLogs(filter.actionType ? { actionType: filter.actionType } : {}),
            getAuditStats()
        ]);

        if (logsData.data) setLogs(logsData.data);
        if (statsData.data) setStats(statsData.data);
        setLoading(false);
    }

    async function handleFilter() {
        setLoading(true);
        const { data } = await getAuditLogs({
            actionType: filter.actionType || undefined,
            startDate: filter.startDate || undefined,
            endDate: filter.endDate || undefined
        });
        if (data) setLogs(data);
        setLoading(false);
    }

    const totalEvents = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
                        <Activity className="h-8 w-8 text-indigo-600" />
                        Audit Trail
                    </h1>
                    <p className="text-gray-600 mt-2">Monitor all system activity and security events</p>
                </div>

                {/* Stats Grid */}
                <BentoGrid className="md:grid-cols-4">
                    <BentoCard variant="gradient" className="hover:scale-105 bg-gradient-to-br from-indigo-400/20 to-purple-400/20">
                        <div className="space-y-2">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl w-fit">
                                <Activity className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-900">{totalEvents}</div>
                                <div className="text-sm text-gray-600 mt-1">Events (24h)</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="space-y-2">
                            <div className="p-3 bg-green-500/20 rounded-2xl w-fit">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-green-600">{stats.login || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Logins</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="space-y-2">
                            <div className="p-3 bg-red-500/20 rounded-2xl w-fit">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-red-600">{stats.failed_login || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">Failed Logins</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="space-y-2">
                            <div className="p-3 bg-blue-500/20 rounded-2xl w-fit">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600">{stats.signup || 0}</div>
                                <div className="text-sm text-gray-600 mt-1">New Users</div>
                            </div>
                        </div>
                    </BentoCard>
                </BentoGrid>

                {/* Filters */}
                <BentoCard variant="glass">
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 space-y-2 min-w-[200px]">
                            <label className="text-sm font-medium text-gray-900">Action Type</label>
                            <Select value={filter.actionType} onValueChange={(v) => setFilter({ ...filter, actionType: v })}>
                                <SelectTrigger className="bg-white/60">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Actions</SelectItem>
                                    <SelectItem value="login">Login</SelectItem>
                                    <SelectItem value="signup">Signup</SelectItem>
                                    <SelectItem value="failed_login">Failed Login</SelectItem>
                                    <SelectItem value="grade_assignment">Grade Assignment</SelectItem>
                                    <SelectItem value="create_broadcast">Create Broadcast</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 space-y-2 min-w-[150px]">
                            <label className="text-sm font-medium text-gray-900">Start Date</label>
                            <Input type="date" className="bg-white/60" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} />
                        </div>
                        <div className="flex-1 space-y-2 min-w-[150px]">
                            <label className="text-sm font-medium text-gray-900">End Date</label>
                            <Input type="date" className="bg-white/60" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} />
                        </div>
                        <Button onClick={handleFilter} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                            <Filter className="h-4 w-4 mr-2" />
                            Apply
                        </Button>
                        <Button variant="outline" onClick={() => { setFilter({ actionType: '', startDate: '', endDate: '' }); loadData(); }}>
                            Reset
                        </Button>
                    </div>
                </BentoCard>

                {/* Activity Log */}
                <BentoCard variant="dark">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-purple-400" />
                        <h3 className="font-semibold text-lg">Activity Log ({logs.length} events)</h3>
                    </div>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                            {logs.map((log) => {
                                const isExpanded = expandedLog === log.id;

                                return (
                                    <div
                                        key={log.id}
                                        className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all cursor-pointer"
                                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3 flex-1">
                                                <Badge className={ACTION_COLORS[log.action_type] || ACTION_COLORS.default}>
                                                    {log.action_type}
                                                </Badge>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {log.user?.full_name || 'System'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{log.user?.username}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                        </div>

                                        {isExpanded && log.details && (
                                            <pre className="text-xs bg-black/20 p-3 rounded-xl mt-2 overflow-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </BentoCard>
            </div>
        </div>
    );
}

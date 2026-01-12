'use client';

import { useState, useEffect } from "react";
import { getSystemHealth, getRealtimeMetrics, getRecentActivity } from "@/app/actions/health";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Activity, 
    Database, 
    Shield, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    RefreshCw, 
    Users, 
    HardDrive, 
    ServerCrash 
} from "lucide-react";
import { Sparkline } from "@/components/admin/health/Sparkline";
import { ActivityFeed } from "@/components/admin/health/ActivityFeed";

export default function HealthMonitorPage() {
    const [health, setHealth] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    useEffect(() => {
        loadHealthData();
        const interval = setInterval(loadHealthData, 30000);
        return () => clearInterval(interval);
    }, []);

    async function loadHealthData() {
        setLoading(true);
        try {
            const [healthData, metricsData, activityData] = await Promise.all([
                getSystemHealth(),
                getRealtimeMetrics(),
                getRecentActivity()
            ]);

            setHealth(healthData);
            setMetrics(metricsData);
            setActivity(activityData);
            setLastCheck(new Date());
        } catch (error) {
            console.error('Failed to load health data:', error);
        }
        setLoading(false);
    }

    const getLatencyColor = (ms: number) => {
        if (ms < 200) return "text-green-600";
        if (ms < 1000) return "text-yellow-600";
        return "text-red-600";
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            healthy: "bg-green-100 text-green-700 border-green-200",
            degraded: "bg-yellow-100 text-yellow-700 border-yellow-200",
            down: "bg-red-100 text-red-700 border-red-200"
        };
        return (
            <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.healthy}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            System Health
                        </h1>
                        <p className="text-slate-500 mt-1">Real-time infrastructure monitoring</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                        {lastCheck && (
                            <span className="text-xs text-slate-400 font-mono">
                                Updated: {lastCheck.toLocaleTimeString()}
                            </span>
                        )}
                        <Button 
                            onClick={loadHealthData} 
                            disabled={loading} 
                            size="sm"
                            variant="outline"
                            className="bg-white"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-4 auto-rows-min">
                    
                    {/* 1. Database Health */}
                    {health && (
                        <BentoCard variant="glass" className="relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-50">
                                <Database className="w-16 h-16 text-slate-100" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Database className="w-5 h-5 text-blue-600" />
                                    </div>
                                    {getStatusBadge(health.database.status)}
                                </div>
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Database Latency</h3>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className={`text-3xl font-bold ${getLatencyColor(health.database.responseTime)}`}>
                                        {health.database.responseTime}
                                        <span className="text-base font-normal text-slate-400 ml-1">ms</span>
                                    </span>
                                </div>
                                <div className="mt-4 h-10 w-full">
                                    <Sparkline 
                                        data={health.database.latencyHistory || []} 
                                        color={health.database.responseTime < 200 ? "#16a34a" : "#ca8a04"} 
                                    />
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* 2. Auth Health */}
                    {health && (
                        <BentoCard variant="glass" className="relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-50">
                                <Shield className="w-16 h-16 text-slate-100" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    {getStatusBadge(health.auth.status)}
                                </div>
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Auth Latency</h3>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className={`text-3xl font-bold ${getLatencyColor(health.auth.responseTime)}`}>
                                        {health.auth.responseTime}
                                        <span className="text-base font-normal text-slate-400 ml-1">ms</span>
                                    </span>
                                </div>
                                <div className="mt-4 h-10 w-full">
                                    <Sparkline 
                                        data={health.auth.latencyHistory || []} 
                                        color={health.auth.responseTime < 200 ? "#9333ea" : "#ca8a04"} 
                                    />
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* 3. Real-time Metrics Column */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Active Users */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Online Now</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">
                                    {metrics?.activeUsers || 0}
                                </p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-full">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Storage</p>
                                <p className="text-xl font-bold text-slate-900 mt-1">
                                    {metrics?.storage.used} <span className="text-xs text-slate-400 font-normal">/ {metrics?.storage.limit}</span>
                                </p>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-full">
                                <HardDrive className="w-5 h-5 text-slate-600" />
                            </div>
                        </div>

                         {/* Error Rate */}
                         <div className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Error Rate (24h)</p>
                                <p className={`text-2xl font-bold mt-1 ${Number(metrics?.errorRate) > 0 ? "text-red-600" : "text-slate-900"}`}>
                                    {metrics?.errorRate}%
                                </p>
                            </div>
                            <div className={`p-2 rounded-full ${Number(metrics?.errorRate) > 0 ? "bg-red-50" : "bg-slate-100"}`}>
                                <ServerCrash className={`w-5 h-5 ${Number(metrics?.errorRate) > 0 ? "text-red-600" : "text-slate-600"}`} />
                            </div>
                        </div>
                    </div>

                    {/* 4. Unified Activity Feed - Spans Full Width */}
                    <BentoCard variant="glass" className="md:col-span-3">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-slate-500" />
                            <h3 className="font-semibold text-lg text-slate-900">Recent Activity Feed</h3>
                        </div>
                        <ActivityFeed items={activity} />
                    </BentoCard>

                </BentoGrid>
            </div>
        </div>
    );
}

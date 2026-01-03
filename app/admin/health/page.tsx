'use client';

import { useState, useEffect } from "react";
import { getSystemHealth, getDatabaseStats, getRecentErrors } from "@/app/actions/health";
import { BentoCard, BentoGrid, BentoStat } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Database, Shield, AlertTriangle, CheckCircle, Clock, RefreshCw, TrendingUp } from "lucide-react";

export default function HealthMonitorPage() {
    const [health, setHealth] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [errors, setErrors] = useState<any>(null);
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
            const [healthData, statsData, errorsData] = await Promise.all([
                getSystemHealth(),
                getDatabaseStats(),
                getRecentErrors()
            ]);

            setHealth(healthData);
            setStats(statsData);
            setErrors(errorsData);
            setLastCheck(new Date());
        } catch (error) {
            console.error('Failed to load health data:', error);
        }
        setLoading(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-500/20 text-green-700 border-green-300';
            case 'degraded': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
            case 'down': return 'bg-red-500/20 text-red-700 border-red-300';
            default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            System Health
                        </h1>
                        <p className="text-gray-600 mt-2">Real-time monitoring of all integrations and services</p>
                    </div>
                    <div className="text-right space-y-2">
                        <Button onClick={loadHealthData} disabled={loading} className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {lastCheck && (
                            <p className="text-xs text-gray-600">
                                Last: {lastCheck.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Bento Grid */}
                <BentoGrid className="grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)]">

                    {/* Overall Status - Large Card */}
                    {health && (
                        <BentoCard
                            variant={health.overall === 'healthy' ? 'gradient' : 'glass'}
                            className={`md:col-span-2 ${health.overall === 'healthy' ? 'bg-gradient-to-br from-green-400/20 to-emerald-400/20' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-3xl ${health.overall === 'healthy' ? 'bg-green-500/20' :
                                        health.overall === 'degraded' ? 'bg-yellow-500/20' :
                                            'bg-red-500/20'
                                    }`}>
                                    {health.overall === 'healthy' ? (
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    ) : (
                                        <AlertTriangle className="h-12 w-12 text-yellow-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">System Status</h3>
                                    <Badge className={getStatusColor(health.overall)}>
                                        {health.overall.toUpperCase()}
                                    </Badge>
                                    <p className="text-xs text-gray-600 mt-2">All services operational</p>
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* Database Health */}
                    {health && (
                        <BentoCard variant="glass" className="hover:scale-105">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                                        <Database className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-gray-900">Database</span>
                                </div>
                                <div>
                                    <Badge className={getStatusColor(health.database.status)}>
                                        {health.database.status}
                                    </Badge>
                                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {health.database.responseTime}ms
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* Auth Service */}
                    {health && (
                        <BentoCard variant="glass" className="hover:scale-105">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-3 bg-purple-500/20 rounded-2xl">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="font-semibold text-gray-900">Authentication</span>
                                </div>
                                <div>
                                    <Badge className={getStatusColor(health.auth.status)}>
                                        {health.auth.status}
                                    </Badge>
                                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {health.auth.responseTime}ms
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* Database Statistics - Large Dark Card */}
                    {stats && (
                        <BentoCard variant="dark" className="md:col-span-2 md:row-span-2">
                            <div className="h-full flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-green-400" />
                                    <h3 className="font-semibold text-lg">Database Metrics</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3 flex-1">
                                    {Object.entries(stats).map(([table, count]: [string, any]) => (
                                        <div key={table} className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                                            <div className="text-3xl font-bold text-green-400">{count}</div>
                                            <div className="text-xs text-gray-400 capitalize mt-1">{table.replace(/_/g, ' ')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </BentoCard>
                    )}

                    {/* Recent Errors */}
                    {errors && errors.count > 0 && (
                        <BentoCard variant="glass" className="md:col-span-2 bg-gradient-to-br from-red-400/10 to-orange-400/10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-2xl">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">Security Alerts</h3>
                                    <p className="text-xs text-gray-600">{errors.count} failed login attempts (24h)</p>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {errors.data.slice(0, 3).map((error: any) => (
                                    <div key={error.id} className="p-2 bg-white/60 rounded-xl text-xs">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-red-900">{error.details?.email || 'Unknown'}</span>
                                            <span className="text-red-600">{new Date(error.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </BentoCard>
                    )}

                </BentoGrid>
            </div>
        </div>
    );
}

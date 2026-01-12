
import { getSystemStats, getRecentAuditLogs } from "@/app/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Database,
    Cpu,
    HardDrive,
    ShieldCheck,
    Megaphone,
    ArrowRight,
    Calendar,
    HelpCircle,
    User,
    ScrollText
} from "lucide-react";
import Link from "next/link";
import { QuickActionsFAB } from "@/components/admin/QuickActionsFAB";
import { AuditLogFeed } from "@/components/admin/AuditLogFeed";
import { BroadcastDialog } from "@/components/admin/BroadcastDialog";

export default async function AdminDashboardScreen() {
    // 1. Fetch System Health & Stats
    const stats = await getSystemStats();
    
    // 2. Fetch Recent Logs
    const { data: recentLogs } = await getRecentAuditLogs(5);

    // 3. Pending Resources (Vetting Queue) - could be moved to getSystemStats but fine here for now
    // Actually, let's just stick to the stats object if we expanded it, but for now we use what we have.
    // The previous code fetched pending resources separately, let's keep it consistent or use the stats object if suitable.
    // stats.resources.total is total, we might want pending specifically. 
    // Let's rely on the previous logic for pending but maybe move it to actions later. For now, let's keep the existing explicit query for pending resources if we want to be safe, OR simply use the stats object if we trust it. 
    // Wait, getSystemStats returned total. Let's assume we want pending count locally for now to minimize changes.
    // Actually, let's just use the stats object for simplicity and update the UI to show "Total" or modify getSystemStats to return pending.
    // Let's modify the UI to use the stats we fetched.

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mission Control</h1>
                    <p className="text-slate-500">System Overview & Administration</p>
                </div>
                <Badge variant={stats.dbStatus === 'Operational' ? 'outline' : 'destructive'} className="text-sm">
                    <Activity className="w-3 h-3 mr-1" /> {stats.dbStatus}
                </Badge>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 1. System Health Pulse */}
                <Card className="col-span-1 lg:col-span-4 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <Activity className="mr-2 h-5 w-5 text-indigo-500" />
                            System Health Pulse
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-100">
                            <div className={`p-2 rounded-full ${stats.dbStatus === 'Operational' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-medium text-slate-500">Database</p>
                                </div>
                                <p className="text-lg font-bold text-slate-900">{stats.dbStatus}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-100">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-medium text-slate-500">Active Users</p>
                                </div>
                                <p className="text-lg font-bold text-slate-900">{stats.users.active}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-100">
                            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                <HardDrive className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <p className="text-sm font-medium text-slate-500">Resources</p>
                                </div>
                                <p className="text-lg font-bold text-slate-900">{stats.resources.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Admissions Funnel & User Stats */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>Total Registered: {stats.users.total}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                             <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="text-sm font-medium">Daily Active Users</span>
                                <span className="text-xl font-bold text-indigo-600">{stats.users.active}</span>
                             </div>
                             {/* Placeholder for a chart or more detailed breakdown */}
                             <div className="h-32 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-sm">
                                User Activity Chart Placeholder
                             </div>
                             <div className="pt-2">
                                <Button variant="outline" size="sm" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50" asChild>
                                    <Link href="/admin/users">
                                        View User Directory
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Recent Activity Feed */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ScrollText className="mr-2 h-5 w-5 text-indigo-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AuditLogFeed logs={recentLogs || []} />
                         <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            <Link href="/admin/audit" className="text-sm text-indigo-600 hover:underline">
                                View Full Audit Log
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Quick Actions */}
                <Card className="col-span-1 lg:col-span-4 shadow-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Launch</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                        <BroadcastDialog 
                            trigger={
                                <Button variant="secondary" className="text-indigo-700 hover:bg-white/90">
                                    <Megaphone className="mr-2 h-4 w-4" /> Broadcast Alert
                                </Button>
                            }
                        />
                        <Button variant="secondary" className="text-indigo-700 hover:bg-white/90" asChild>
                            <Link href="/admin/events/create">
                                <Calendar className="mr-2 h-4 w-4" /> Create Event
                            </Link>
                        </Button>
                         <Button variant="secondary" className="text-indigo-700 hover:bg-white/90" asChild>
                            <Link href="/admin/resources">
                                <ShieldCheck className="mr-2 h-4 w-4" /> Review Resources
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

            </div>

            {/* Quick Actions FAB - Client Component */}
            <QuickActionsFAB />
        </div>
    );
}

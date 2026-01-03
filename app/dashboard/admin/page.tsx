
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
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
    Calendar
} from "lucide-react";
import Link from "next/link";
import { QuickActionsFAB } from "@/components/admin/QuickActionsFAB";

export default async function AdminDashboardScreen() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Fetch System Health (Mock logic + Real DB Check)
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    const dbStatus = dbError ? 'Degraded' : 'Operational';

    // 2. Fetch Admissions Funnel Data
    const { count: pendingUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: reviewUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'review');
    const { data: activeCount } = await supabase.rpc('get_daily_active_users');

    // 3. Vetting Queue
    const { count: pendingResources } = await supabase.from('academic_resources').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mission Control</h1>
                    <p className="text-slate-500">System Overview & Administration</p>
                </div>
                <Badge variant={dbStatus === 'Operational' ? 'outline' : 'destructive'} className="text-sm">
                    <Activity className="w-3 h-3 mr-1" /> {dbStatus}
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
                    <CardContent className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-100">
                            <div className={`p-2 rounded-full ${dbStatus === 'Operational' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Database</p>
                                <p className="text-lg font-bold text-slate-900">{dbStatus}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-100">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                                <Cpu className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">AI Credits</p>
                                <p className="text-lg font-bold text-slate-900">Healthy</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-slate-100">
                            <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                                <HardDrive className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Storage</p>
                                <p className="text-lg font-bold text-slate-900">45% Used</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Admissions Funnel */}
                <Card className="col-span-1 lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Admissions Funnel</span>
                            {(pendingUsers || 0) > 10 && <Badge variant="destructive">{pendingUsers} Pending</Badge>}
                        </CardTitle>
                        <CardDescription>User onboarding flow status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Pending Stage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">1. Pending Verification</span>
                                <span className="text-slate-500">{pendingUsers || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(((pendingUsers || 0) / 20) * 100, 100)}%` }} />
                            </div>
                        </div>

                        {/* Review Stage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">2. In Review</span>
                                <span className="text-slate-500">{reviewUsers || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(((reviewUsers || 0) / 20) * 100, 100)}%` }} />
                            </div>
                        </div>

                        {/* Active Stage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-700">3. Active Users (24h)</span>
                                <span className="text-slate-500">{activeCount || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Vetting Queue Counter */}
                <Link href="/dashboard/admin/resources" className="block col-span-1">
                    <Card className="h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <CardHeader>
                            <CardTitle className="flex items-center text-slate-700 group-hover:text-indigo-600 transition-colors">
                                <ShieldCheck className="mr-2 h-5 w-5" />
                                Vetting Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-900 mb-2">
                                {pendingResources || 0}
                            </div>
                            <p className="text-sm text-slate-500">Resources pending review</p>
                            {(pendingResources || 0) > 0 && (
                                <div className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600">
                                    Review Now <ArrowRight className="ml-1 h-4 w-4" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Link>

                {/* 4. Quick Actions Placeholder */}
                <Card className="col-span-1 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Launch</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="secondary" className="w-full justify-start text-indigo-700 hover:bg-white/90">
                            <Megaphone className="mr-2 h-4 w-4" /> Broadcast Alert
                        </Button>
                        <Button variant="secondary" className="w-full justify-start text-indigo-700 hover:bg-white/90" asChild>
                            <Link href="/dashboard/admin/events/create">
                                <Calendar className="mr-2 h-4 w-4" /> Create Event
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

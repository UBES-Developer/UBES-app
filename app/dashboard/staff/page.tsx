
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    BookOpen,
    Users,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    QrCode
} from "lucide-react";
import Link from "next/link";

export default async function StaffDashboard() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Mock Data (to be replaced with real DB queries)
    const liveClass = {
        code: "PHYS201",
        name: "Fluid Mechanics - Lab 4B",
        time: "Now",
        location: "Lab Complex A",
        active: true
    };

    const gradingStats = {
        graded: 14,
        total: 60,
        assignment: "Mid-Term Essay"
    };

    const consultations = [
        { id: 1, student: "Alice Smith", time: "Tomorrow, 10:00 AM", status: "pending" },
        { id: 2, student: "Bob Jones", time: "Tomorrow, 10:30 AM", status: "pending" },
    ];

    const atRiskStudents = [
        { id: 's1', name: 'Sarah Connor', issue: 'Missed 3 Classes' },
        { id: 's2', name: 'John Doe', issue: 'Failed Quiz 2' },
    ];

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Teaching Cockpit</h1>
                    <p className="text-slate-500">Overview of your academic activities.</p>
                </div>
                <div className="text-sm text-slate-500 flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* 1. Hero Widget: Live Class Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-md border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center text-indigo-100">
                            <Clock className="mr-2 h-5 w-5" /> Live Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {liveClass.active ? (
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-1">{liveClass.code}: {liveClass.name}</h2>
                                    <p className="text-indigo-200 flex items-center">
                                        <Users className="w-4 h-4 mr-1" /> {liveClass.location} • {liveClass.time}
                                    </p>
                                </div>
                                <Button size="lg" className="bg-white text-indigo-700 hover:bg-slate-100 w-full md:w-auto font-semibold shadow" asChild>
                                    <Link href="/dashboard/staff/attendance">
                                        <QrCode className="mr-2 h-5 w-5" /> Start Class Mode
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-indigo-200">
                                No classes scheduled right now.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Grading Stack */}
                <Card className="col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-700">
                            <BookOpen className="mr-2 h-5 w-5 text-amber-500" /> Grading Stack
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-slate-900">{gradingStats.assignment}</span>
                                <span className="text-slate-500">{gradingStats.graded}/{gradingStats.total}</span>
                            </div>
                            <Progress value={(gradingStats.graded / gradingStats.total) * 100} className="h-2" />
                            <p className="text-xs text-slate-500 mt-2 text-right">46 remaining</p>
                        </div>
                        <Button variant="outline" className="w-full text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border-dashed" asChild>
                            <Link href="/dashboard/staff/grading">
                                Continue Grading <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 3. Consultation Requests */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-700">
                            <Users className="mr-2 h-5 w-5 text-blue-500" /> Consultation Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {consultations.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <p className="font-medium text-slate-900">{req.student}</p>
                                    <p className="text-xs text-slate-500">{req.time}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50">Accept</Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-slate-600">Decline</Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 4. At-Risk Radar */}
                <Card className="shadow-sm border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="flex items-center text-slate-700">
                            <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> At-Risk Radar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {atRiskStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-3"></div>
                                    <div>
                                        <p className="font-medium text-slate-900">{student.name}</p>
                                        <p className="text-xs text-red-500 font-medium">{student.issue}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-50">
                                    Nudge
                                </Button>
                            </div>
                        ))}
                        <div className="pt-2">
                            <Button variant="link" className="text-slate-500 hover:text-slate-900 p-0 h-auto text-xs">
                                View all flagged students
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

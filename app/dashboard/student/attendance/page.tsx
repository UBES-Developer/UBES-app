'use client';

import { useState, useEffect } from "react";
import { getAttendanceHistory, getActiveSessions, submitOTP, submitDispute } from "@/app/actions/attendance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, QrCode, AlertCircle, CheckCircle, Clock } from "lucide-react"; // Icons
import { toast } from "sonner";

export default function AttendancePage() {
    const [history, setHistory] = useState<any[]>([]);
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // Changed default to false to avoid button disabled on mount
    const [otpCode, setOtpCode] = useState("");

    // Dispute State
    const [disputeSessionId, setDisputeSessionId] = useState<string | null>(null);
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeOpen, setDisputeOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const [histRes, activeRes] = await Promise.all([
            getAttendanceHistory(),
            getActiveSessions()
        ]);
        if (histRes.data) setHistory(histRes.data);
        if (activeRes.data) setActiveSessions(activeRes.data);
    }

    async function handleSubmitCode() {
        if (otpCode.length < 4) return;
        setLoading(true);

        const res = await submitOTP(otpCode);
        
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Checked in for ${res.module}!`);
            setOtpCode("");
            loadData();
        }
    }

    async function handleDispute() {
        if (!disputeSessionId) return;
        const res = await submitDispute(disputeSessionId, disputeReason);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Dispute submitted for review.");
            setDisputeOpen(false);
            setDisputeReason("");
        }
    }

    // Calculations
    const total = history.length;
    const present = history.filter(h => h.status === 'present').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Attendance Tracker</h1>
                    <p className="text-gray-500 mt-1">Manage your presence and academic compliance.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Attendance Rate</CardTitle></CardHeader>
                        <CardContent>
                            <div className={`text-4xl font-bold ${rate >= 90 ? 'text-green-600' : rate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {rate}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Target: 90%</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Classes Attended</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900">{present}</div>
                            <p className="text-xs text-gray-500 mt-1">Total Sessions: {total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Active Sessions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-600">{activeSessions.length}</div>
                            <p className="text-xs text-gray-500 mt-1">Happening Now</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* LEFT: Check-In & History */}
                    <div className="space-y-6">
                        {/* Check In Panel */}
                        {/* OTC Check In Panel */}
                        <Card className="border-indigo-100 bg-indigo-50/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-indigo-600" /> Live Attendance</CardTitle>
                                    <CardDescription>Enter the 4-digit code provided by your lecturer.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="0000" 
                                        className="text-center text-2xl tracking-widest font-mono font-bold uppercase h-14"
                                        maxLength={4}
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSubmitCode();
                                        }}
                                    />
                                </div>
                                <Button 
                                    className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                                    onClick={handleSubmitCode}
                                    disabled={loading || otpCode.length < 4}
                                >
                                    {loading ? "Verifying..." : "Submit Code"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Recent History List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {history.slice(0, 5).map(scan => (
                                    <div key={scan.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${scan.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {scan.status === 'present' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{scan.attendance_sessions?.module_code || 'Unknown Module'}</div>
                                                <div className="text-xs text-gray-500">{new Date(scan.scanned_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <Badge variant={scan.status === 'present' ? 'default' : 'destructive'} className="capitalize">{scan.status}</Badge>
                                    </div>
                                ))}
                                {history.length === 0 && <div className="text-sm text-gray-500">No attendance records yet.</div>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT: Heatmap / Calendar */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Attendance Heatmap</CardTitle>
                            <div className="flex gap-2 text-xs">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Present</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Absent</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Excused</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <HeatmapGrid history={history} />

                            <div className="mt-8 pt-4 border-t">
                                <h4 className="text-sm font-semibold mb-2">Need to raise a dispute?</h4>
                                <p className="text-xs text-gray-500 mb-4">If you were marked absent incorrectly, you can flag it within 48 hours.</p>
                                <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">File a Dispute</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>File Attendance Dispute</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Select Session</Label>
                                                <select
                                                    className="w-full border rounded-md p-2 text-sm"
                                                    onChange={(e) => setDisputeSessionId(e.target.value)}
                                                    value={disputeSessionId || ''}
                                                >
                                                    <option value="">-- Choose a session --</option>
                                                    {history.filter(h => h.status !== 'present').map(h => (
                                                        <option key={h.id} value={h.session_id}>
                                                            {new Date(h.attendance_sessions?.session_date).toLocaleDateString()} - {h.attendance_sessions?.module_code} ({h.status})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reason</Label>
                                                <Textarea
                                                    placeholder="e.g. I was present but the scanner failed..."
                                                    value={disputeReason}
                                                    onChange={(e) => setDisputeReason(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleDispute} disabled={!disputeSessionId}>Submit</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Simple Heatmap Component (Last 35 days)
function HeatmapGrid({ history }: { history: any[] }) {
    // Generate last 35 days
    const days = Array.from({ length: 35 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (34 - i));
        return d;
    });

    const getStatusForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        // Find if we had a session this day
        // For simplicity, we check if we have a scan. 
        // Real implementation matches against Timetable to see if we were SUPPOSED to be there (Absent).
        // Here we just show "Present" scans. Identifying "Absent" requires knowing the schedule.
        // We'll mark found scans.

        const scan = history.find(h => h.scanned_at.startsWith(dateStr));
        if (scan) return scan.status;
        return 'none';

        // TODO: In full version, cross-reference with 'attendance_sessions' where user was enrolled to show Red for absent.
    };

    return (
        <div className="grid grid-cols-7 gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
            ))}
            {days.map((day, i) => {
                const status = getStatusForDay(day);
                let bg = 'bg-gray-100';
                if (status === 'present') bg = 'bg-green-500';
                if (status === 'late') bg = 'bg-yellow-500';
                if (status === 'absent') bg = 'bg-red-500';
                if (status === 'excused') bg = 'bg-blue-400';

                return (
                    <div key={i} className="flex flex-col items-center gap-1 group relative">
                        <div className={`w-full aspect-square rounded-md ${bg} transition-colors hover:opacity-80`}></div>
                        <div className="text-[10px] text-gray-400">{day.getDate()}</div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs p-1 rounded whitespace-nowrap z-10">
                            {day.toLocaleDateString()}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

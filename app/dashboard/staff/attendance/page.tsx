
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { DynamicQR } from "./DynamicQR";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Monitor, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AttendancePage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch real active session
    const { data: session } = await supabase
        .from('attendance_sessions')
        .select('*')
        .eq('lecturer_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Monitor className="h-16 w-16 text-slate-700 mx-auto" />
                    <h1 className="text-2xl font-bold text-white">No Active Session</h1>
                    <p className="text-slate-400">You don't have a live class running right now.</p>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/dashboard/staff">Return to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Determine counts (real or placeholder if no scan table linked properly yet)
    // For now we just show the session info.

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Mesh Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-50 z-0"></div>

            {/* Floating UI Layer */}
            <div className="z-10 w-full max-w-5xl flex flex-col items-center space-y-8">

                {/* Header Bar */}
                <div className="w-full flex justify-between items-center bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-xl text-white">
                    <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                        <Link href="/dashboard/staff">
                            <ArrowLeft className="mr-2 h-5 w-5" /> End Session
                        </Link>
                    </Button>
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-green-400 border-green-500/50 bg-green-500/10 px-3 py-1">
                            <Monitor className="w-3 h-3 mr-2 animate-pulse" /> Live Projector Mode
                        </Badge>
                        <div className="flex items-center text-slate-300">
                            <Users className="w-4 h-4 mr-2" />
                            <span className="font-mono text-xl text-white font-bold">--</span>
                            <span className="mx-1">/</span>
                            <span>--</span>
                        </div>
                    </div>
                </div>

                {/* Main QR Card */}
                <DynamicQR sessionId={session.id} courseName={session.module_code} />

            </div>
        </div>
    );
}

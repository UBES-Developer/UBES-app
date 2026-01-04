import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Code, Book, Users, ExternalLink, ArrowRight, Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import { getUpcomingAssignments, getPriorityAssignments } from "@/app/actions/assignments";
import BroadcastBanner from "@/components/dashboard/BroadcastBanner";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { ConsultationRequestDialog } from "./ConsultationRequestDialog";
import { ToolboxDialog } from "@/components/toolbox/ToolboxDialog";

export default async function StudentDashboard() {
    const nextUp = await getUpcomingAssignments();
    const priorityQueue = await getPriorityAssignments();

    // Fetch user for personalized greeting
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    const name = user?.user_metadata?.username || user?.user_metadata?.full_name || 'Engineer';

    // Fetch active groups for dashboard
    const { data: myGroups } = await supabase
        .from('group_members')
        .select('*, group:student_groups(*)')
        .eq('user_id', user?.id)
        .limit(2);

    const topTask = nextUp.length > 0 ? nextUp[0] : null;

    return (
        <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Command Center</h1>
                    <p className="text-slate-500">Welcome back, {name}.</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <div>
                        <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                        <p className="text-xs text-slate-500">Week 4 • Semester 1</p>
                    </div>
                    <ConsultationRequestDialog />
                </div>
            </div>

            <BroadcastBanner />

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">

                {/* 1. Next Up Card using AI Logic (2x2) */}
                <Card className="col-span-1 md:col-span-2 row-span-2 shadow-sm border-slate-200 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-indigo-500" />
                            <span>Next Up</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-4">
                        {topTask ? (
                            <>
                                <div className="bg-indigo-50 p-4 rounded-full">
                                    <Book className="h-8 w-8 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">{topTask.title}</h3>
                                    <p className="text-sm text-slate-500">
                                        Due: {new Date(topTask.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(topTask.deadline).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">Priority: High</Badge>
                                    <Badge variant="secondary">{topTask.module}</Badge>
                                </div>
                                <Button className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-700" asChild>
                                    <Link href={`/dashboard/student/assignments/${topTask.id}`}>Start Working</Link>
                                </Button>
                                <p className="text-xs text-slate-400 mt-2">AI Suggestion: "Based on difficulty {topTask.difficulty_score}/10, start now."</p>
                            </>
                        ) : (
                            <div className="text-slate-400">
                                <p>No immediate deadlines.</p>
                                <p className="text-xs">Take a break or check the backlog.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 2. Engineering Toolbox (1x1) */}
                <Card className="col-span-1 shadow-sm border-slate-200 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-base">
                            <Code className="h-4 w-4 mr-2 text-slate-500" />
                            Toolbox
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center space-y-3">
                        <div className="text-center space-y-1 mb-2">
                            <div className="text-2xl font-bold text-slate-900">15+</div>
                            <p className="text-xs text-slate-500">Apps & Resources</p>
                        </div>
                        <ToolboxDialog>
                            <Button variant="outline" className="w-full border-dashed border-slate-300 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600">
                                Open Toolkit <ExternalLink className="h-3 w-3 ml-2" />
                            </Button>
                        </ToolboxDialog>
                    </CardContent>
                </Card>

                {/* 3. Study Prioritizer (1x2) - Vertical list */}
                <Card className="col-span-1 row-span-2 shadow-sm border-slate-200 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base">Focus Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {/* List of items sorted by AI */}
                        {priorityQueue.slice(0, 5).map((item, i) => (
                            <div key={item.id} className="flex flex-col p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${i === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {i === 0 ? '#1 Priority' : `#${i + 1}`}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{new Date(item.deadline).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{item.title}</p>
                            </div>
                        ))}
                        {priorityQueue.length === 0 && <p className="text-sm text-slate-400">No tasks in queue.</p>}
                    </CardContent>
                </Card>

                {/* 4. AI Toolkit (1x1) */}
                <Card className="col-span-1 shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-base">
                            <Brain className="h-4 w-4 mr-2 text-indigo-500" />
                            AI Toolkit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="text-2xl font-bold text-slate-900">12</div>
                            <p className="text-xs text-slate-500">Models & Agents</p>
                        </div>
                        <Button className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-white" asChild>
                            <Link href="/dashboard/student/ai-center">
                                Open AI Center <Sparkles className="h-3 w-3 ml-1 text-yellow-300" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* 5. My Groups (Active Workspace) */}
                <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-base">
                            <Users className="h-4 w-4 mr-2 text-indigo-500" />
                            Active Squads
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {myGroups && myGroups.length > 0 ? (
                                myGroups.map((membership: any) => (
                                    <div key={membership.group_id} className="flex items-start justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100/50 transition-colors cursor-pointer group relative">
                                        <Link href={`/dashboard/student/groups/${membership.group_id}`} className="absolute inset-0" />
                                        <div className="flex gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 overflow-hidden">
                                                {membership.group.image_url ? (
                                                    <img src={membership.group.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700">{membership.group.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    {membership.group.current_project ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                            <Sparkles className="h-3 w-3" />
                                                            Project: {membership.group.current_project}
                                                        </span>
                                                    ) : (
                                                        <span>General Member</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 z-10" asChild>
                                            <Link href={`/dashboard/student/groups/${membership.group_id}`}>Open Workspace</Link>
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-400 mb-2">No active squads.</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/dashboard/student/groups">Find a Team</Link>
                                    </Button>
                                </div>
                            )}

                            {myGroups && myGroups.length > 0 && (
                                <div className="text-center pt-1">
                                    <Link href="/dashboard/student/groups" className="text-xs text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1">
                                        View all groups <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div >
    );
}

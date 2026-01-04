import { getGroupWorkspaceData, addTask, addResource } from "@/app/actions/group-workspace";
import { GroupKanban } from "@/components/groups/GroupKanban";
import { GroupChat } from "@/components/groups/GroupChat";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Github, FileText, Plus, Users, Activity, ExternalLink, GitCommit } from "lucide-react";
import Link from "next/link";
import { AddTaskDialog, AddResourceDialog } from "@/components/groups/AddWorkspaceItems";

export default async function GroupWorkspacePage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const data = await getGroupWorkspaceData(id);

    if (data.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/dashboard/student/groups">← Back to Groups</Link>
                </Button>
                <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
                <p className="text-slate-500">{data.error}</p>
                {data.error === "You are not a member of this group" && (
                    <Button className="mt-4" asChild>
                        <Link href="/dashboard/student/groups">Join Group</Link>
                    </Button>
                )}
            </div>
        );
    }

    const { group, tasks, posts, resources, currentUser } = data;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="bg-white">{group.type.toUpperCase()}</Badge>
                        <Link href="/dashboard/student/groups" className="text-xs text-slate-500 hover:text-indigo-600">Back to Directory</Link>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
                    <p className="text-slate-500">{group.description}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Users className="h-4 w-4 mr-2" /> Members</Button>
                    <Button variant="outline"><Activity className="h-4 w-4 mr-2" /> Analytics</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Workspace (Left 3 cols) */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Active Project Banner */}
                    <Card className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white border-none shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity className="h-48 w-48 text-white" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-indigo-200 text-sm font-medium tracking-wider uppercase">Active Project</CardTitle>
                            <h2 className="text-2xl font-bold mt-1">
                                {group.current_project || "General Team Operations"}
                            </h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
                                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                                    <Activity className="h-3 w-3" /> Status: On Track
                                </div>
                                <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                                    <Users className="h-3 w-3" /> 5 Active Contributors
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="board" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList>
                                <TabsTrigger value="board">Kanban Board</TabsTrigger>
                                <TabsTrigger value="chat">Team Chat</TabsTrigger>
                                <TabsTrigger value="resources">Resources</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="board" className="h-[600px]">
                            <div className="flex items-center justify-end mb-4">
                                <AddTaskDialog groupId={id} />
                            </div>
                            <GroupKanban groupId={id} initialTasks={tasks || []} />
                        </TabsContent>

                        <TabsContent value="chat">
                            <div className="grid grid-cols-1 gap-4">
                                <GroupChat groupId={id} initialPosts={posts || []} currentUserId={currentUser || ""} />
                            </div>
                        </TabsContent>

                        <TabsContent value="resources">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Project Files</CardTitle>
                                        <CardDescription>Shared technical documentation.</CardDescription>
                                    </div>
                                    <AddResourceDialog groupId={id} />
                                </CardHeader>
                                <CardContent>
                                    {(!resources || resources.length === 0) && <div className="text-center text-slate-400 py-8">No files uploaded yet.</div>}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(resources || []).map((res: any) => (
                                            <div key={res.id} className="flex items-start p-3 border rounded-lg hover:bg-slate-50 transition-colors group">
                                                <div className="p-2 bg-indigo-50 rounded mr-3">
                                                    <FileText className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-900 truncate">{res.title}</h4>
                                                    <p className="text-xs text-slate-500 capitalize">{res.category || 'General'}</p>
                                                </div>
                                                <a href={res.file_url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-600">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar (Right 1 col) */}
                <div className="space-y-6">
                    {/* GitHub Repo Widget */}
                    <Card className="border-slate-200">
                        <CardHeader className="pb-3 border-b bg-slate-50/50">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Github className="h-4 w-4 text-slate-900" /> Repository
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="text-sm">
                                <div className="font-medium text-slate-900 truncate">
                                    {group.github_repo_url ? group.github_repo_url.split('/').pop() : 'project-repo'}
                                </div>
                                <div className="text-xs text-slate-500">main branch</div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-xs text-slate-600">
                                    <GitCommit className="h-3 w-3 mt-0.5 text-slate-400" />
                                    <div>
                                        <span className="font-medium">feat: new chassis design</span>
                                        <div className="text-slate-400">2h ago by @teejay</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-slate-600">
                                    <GitCommit className="h-3 w-3 mt-0.5 text-slate-400" />
                                    <div>
                                        <span className="font-medium">fix: motor controller bug</span>
                                        <div className="text-slate-400">5h ago by @alex</div>
                                    </div>
                                </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <a href={group.github_repo_url || "#"} target="_blank">View Code</a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* AI Health Dashboard */}
                    <Card className="border-indigo-100 bg-indigo-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-900">
                                <Activity className="h-4 w-4 text-indigo-600" /> Team Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Momentum</span>
                                    <span className="font-bold text-green-600">High</span>
                                </div>
                                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[85%]"></div>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-indigo-100 text-xs space-y-2">
                                <div className="font-medium text-indigo-900">AI Insight</div>
                                <p className="text-slate-600 leading-snug">
                                    "Collaboration is peaking! 8 tasks completed this week. Consider scheduling a sync for the Blocking issue in 'Chassis'."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

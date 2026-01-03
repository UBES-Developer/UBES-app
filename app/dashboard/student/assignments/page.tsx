'use client';

import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function AssignmentsPage() {
    // Mock Data for now as we focus on fixing the 404
    const assignments = [
        { id: 1, title: 'Engineering Ethics Essay', module: 'ETH101', due: '2025-01-15', status: 'pending', priority: 'high' },
        { id: 2, title: 'Structural Analysis Report', module: 'CIV202', due: '2025-01-20', status: 'in_progress', priority: 'medium' },
        { id: 3, title: 'Lab Safety Quiz', module: 'LAB101', due: '2024-12-10', status: 'submitted', priority: 'low' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500 mt-1">Track your coursework and deadlines.</p>
                </div>

                <BentoGrid className="md:grid-cols-3">
                    {/* Summary Stats */}
                    <BentoCard variant="gradient" className="bg-gradient-to-br from-orange-100 to-red-100 md:col-span-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-200 rounded-lg"><Clock className="h-5 w-5 text-orange-700" /></div>
                            <div className="font-bold text-orange-900">Pending</div>
                        </div>
                        <div className="text-3xl font-bold text-orange-800">2</div>
                        <div className="text-xs text-orange-700">Due this week</div>
                    </BentoCard>

                    <BentoCard variant="glass" className="md:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Upcoming Deadlines</h3>
                            <Button size="sm" variant="outline">View Calendar</Button>
                        </div>
                        <div className="space-y-3">
                            {assignments.filter(a => a.status !== 'submitted').map(a => (
                                <div key={a.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${a.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">{a.title}</div>
                                            <div className="text-xs text-gray-500">{a.module} • Due {a.due}</div>
                                        </div>
                                    </div>
                                    <Badge variant={a.priority === 'high' ? 'destructive' : 'secondary'}>{a.status.replace('_', ' ')}</Badge>
                                </div>
                            ))}
                        </div>
                    </BentoCard>
                </BentoGrid>

                <h2 className="text-xl font-bold">All Tasks</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map(assign => (
                        <div key={assign.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="outline">{assign.module}</Badge>
                                {assign.status === 'submitted' ? (
                                    <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Done</Badge>
                                ) : (
                                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Due {assign.due}</Badge>
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-2">{assign.title}</h3>
                            <p className="text-sm text-gray-500 mb-6">Submit your work before the deadline to avoid penalties.</p>

                            <Button className="w-full" variant={assign.status === 'submitted' ? 'secondary' : 'default'} disabled={assign.status === 'submitted'}>
                                {assign.status === 'submitted' ? 'View Submission' : 'Submit Assignment'}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

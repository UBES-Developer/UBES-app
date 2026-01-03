'use client';

import { useState, useEffect } from "react";
import { getStudentHealthData } from "@/app/actions/lecturer";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, TrendingDown, Users } from "lucide-react";

export default function StudentRadarPage() {
    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const { data } = await getStudentHealthData();
        if (data) setStudents(data);
    }

    const atRiskStudents = students.filter(s => (s.avg_grade || 0) < 50);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Student Health Radar
                    </h1>
                    <p className="text-gray-600 mt-2">Monitor at-risk students and performance trends</p>
                </div>

                {/* Stats */}
                <BentoGrid className="md:grid-cols-3">
                    <BentoCard variant="gradient" className="hover:scale-105 bg-gradient-to-br from-orange-400/20 to-red-400/20">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/20 rounded-2xl">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-red-600">{atRiskStudents.length}</div>
                                <div className="text-sm text-gray-600 mt-1">At-Risk Students</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600">{students.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Students</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <Activity className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-purple-600">
                                    {((atRiskStudents.length / (students.length || 1)) * 100).toFixed(0)}%
                                </div>
                                <div className="text-sm text-gray-600 mt-1">Risk Rate</div>
                            </div>
                        </div>
                    </BentoCard>
                </BentoGrid>

                {/* At-Risk Students */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Students Needing Attention
                    </h2>
                    <BentoGrid className="md:grid-cols-2 lg:grid-cols-3">
                        {atRiskStudents.map((student) => (
                            <BentoCard key={student.id} variant="glass" className="bg-gradient-to-br from-red-400/10 to-orange-400/10">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{student.full_name}</h3>
                                            <p className="text-sm text-gray-600">{student.username}</p>
                                        </div>
                                        <Badge className="bg-red-500/20 text-red-700 border-red-300">
                                            At Risk
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="p-2 bg-white/60 rounded-xl">
                                            <div className="text-xs text-gray-600">Avg Grade</div>
                                            <div className="text-lg font-bold text-red-600">{student.avg_grade?.toFixed(1) || 0}%</div>
                                        </div>
                                        <div className="p-2 bg-white/60 rounded-xl">
                                            <div className="text-xs text-gray-600">Submissions</div>
                                            <div className="text-lg font-bold text-gray-900">{student.submission_count || 0}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                        <span>Requires intervention</span>
                                    </div>
                                </div>
                            </BentoCard>
                        ))}

                        {atRiskStudents.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No at-risk students - Great work!</p>
                            </div>
                        )}
                    </BentoGrid>
                </section>

                {/* All Students Performance */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Class Overview</h2>
                    <BentoCard variant="dark">
                        <div className="space-y-3">
                            {students.slice(0, 10).map((student) => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                    <div>
                                        <p className="font-medium">{student.full_name}</p>
                                        <p className="text-xs text-gray-400">{student.submission_count || 0} submissions</p>
                                    </div>
                                    <Badge className={`${(student.avg_grade || 0) >= 70 ? 'bg-green-500/20 text-green-300' :
                                            (student.avg_grade || 0) >= 50 ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-red-500/20 text-red-300'
                                        }`}>
                                        {student.avg_grade?.toFixed(1) || 0}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </BentoCard>
                </section>
            </div>
        </div>
    );
}

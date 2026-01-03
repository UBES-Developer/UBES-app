import { getStudentTranscript } from "@/app/actions/academic";
import { BentoCard, BentoGrid, BentoStat } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Download, TrendingUp, Award, FileText } from "lucide-react";
import { TranscriptActions } from "@/components/academic/TranscriptActions";

export default async function TranscriptPage() {
    const { data: grades } = await getStudentTranscript();

    // Calculate statistics
    const totalGrades = grades?.length || 0;
    const averageGrade = grades?.reduce((acc, curr) => acc + (curr.grade || 0), 0) / (totalGrades || 1);
    const passedModules = grades?.filter(g => (g.grade || 0) >= 50).length || 0;
    const gpa = (averageGrade / 25).toFixed(2); // Simple GPA calculation (0-4 scale)

    // Group by module
    const moduleStats = grades?.reduce((acc: any, curr) => {
        const module = curr.module || 'Unknown';
        if (!acc[module]) {
            acc[module] = { grades: [], avg: 0 };
        }
        acc[module].grades.push(curr.grade);
        acc[module].avg = acc[module].grades.reduce((a: number, b: number) => a + b, 0) / acc[module].grades.length;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Academic Transcript
                        </h1>
                        <p className="text-gray-600 mt-2">View your complete grade history and performance metrics</p>
                    </div>
                    <TranscriptActions />
                </div>

                {/* Stats Grid */}
                <BentoGrid className="grid-cols-1 md:grid-cols-4 auto-rows-[minmax(150px,auto)]">

                    {/* GPA Card */}
                    <BentoCard variant="gradient" className="hover:scale-105">
                        <BentoStat
                            label="Cumulative GPA"
                            value={gpa}
                            icon={<Award className="h-6 w-6 text-white" />}
                            color="purple"
                        />
                    </BentoCard>

                    {/* Average Grade */}
                    <BentoCard variant="glass" className="hover:scale-105">
                        <BentoStat
                            label="Average Grade"
                            value={`${averageGrade.toFixed(1)}%`}
                            icon={<TrendingUp className="h-6 w-6 text-white" />}
                            color="blue"
                        />
                    </BentoCard>

                    {/* Modules Passed */}
                    <BentoCard variant="glass" className="hover:scale-105">
                        <BentoStat
                            label="Modules Passed"
                            value={`${passedModules}/${totalGrades}`}
                            icon={<GraduationCap className="h-6 w-6 text-white" />}
                            color="green"
                        />
                    </BentoCard>

                    {/* Total Credits */}
                    <BentoCard variant="glass" className="hover:scale-105">
                        <BentoStat
                            label="Total Assessments"
                            value={totalGrades}
                            icon={<FileText className="h-6 w-6 text-white" />}
                            color="orange"
                        />
                    </BentoCard>

                    {/* Module Breakdown - Large Card */}
                    <BentoCard variant="glass" className="md:col-span-2 md:row-span-2">
                        <div className="h-full">
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Module Performance</h3>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto">
                                {moduleStats && Object.entries(moduleStats).map(([module, stats]: [string, any]) => (
                                    <div key={module} className="p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-gray-900">{module}</span>
                                            <Badge className={`${stats.avg >= 70 ? 'bg-green-500/20 text-green-700 border-green-300' :
                                                stats.avg >= 50 ? 'bg-blue-500/20 text-blue-700 border-blue-300' :
                                                    'bg-red-500/20 text-red-700 border-red-300'
                                                }`}>
                                                {stats.avg.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${stats.avg >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                    stats.avg >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                                                        'bg-gradient-to-r from-red-400 to-red-600'
                                                    }`}
                                                style={{ width: `${stats.avg}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Recent Grades - Dark Card */}
                    <BentoCard variant="dark" className="md:col-span-2 md:row-span-2">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-purple-400" />
                                <h3 className="text-xl font-bold">Recent Grades</h3>
                            </div>
                            <div className="space-y-2 flex-1 overflow-y-auto">
                                {grades?.slice(0, 8).map((grade: any) => (
                                    <div key={grade.id} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm">{grade.title}</p>
                                                <p className="text-xs text-gray-400">{grade.module}</p>
                                            </div>
                                            <Badge className={`${(grade.grade || 0) >= 70 ? 'bg-green-500/20 text-green-300' :
                                                (grade.grade || 0) >= 50 ? 'bg-blue-500/20 text-blue-300' :
                                                    'bg-red-500/20 text-red-300'
                                                }`}>
                                                {grade.grade}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                </BentoGrid>
            </div>
        </div>
    );
}

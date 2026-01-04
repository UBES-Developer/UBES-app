import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { SubmissionUpload } from "@/components/assignments/SubmissionUpload";

export default async function AssignmentSubmissionPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    // Mock Data (Replace with DB Fetch from 'assignments' and 'submissions')
    const assignment = {
        title: "Thermodynamics Lab 1",
        code: "MECH201",
        description: "Submit your final report detailing the heat exchange experiment. Ensure all graphs are labeled.",
        dueDate: new Date(Date.now() + 86400000 * 2), // 2 days
        allowDrafts: true,
        status: "draft", // or 'submitted', 'graded'
        feedback: null
    };

    const submissionHistory = [
        { id: 1, name: "draft_v1.pdf", time: "Yesterday, 4:00 PM", ai_check: "Passed (98%)" }
    ];

    async function submitAction(formData: FormData) {
        "use server";
        // Logic: 
        // 1. Verify Integrity Pledge
        // 2. Upload File
        // 3. Update Submission Status -> 'submitted' 
        console.log("Submitting...");
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{assignment.code}</Badge>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Due in 2 days</Badge>
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Submission Interface */}
                <div className="lg:col-span-2 space-y-6">
                    <SubmissionUpload
                        assignmentId={id}
                        allowDrafts={assignment.allowDrafts}
                        submissionHistory={submissionHistory}
                    />
                </div>

                {/* Right: Requirements & Rubric */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 space-y-4">
                            <p>{assignment.description}</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Use 12pt Times New Roman.</li>
                                <li>Include all raw data in Appendix A.</li>
                                <li><strong>4 Page Maximum.</strong></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm bg-slate-50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center text-slate-700">
                                <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" />
                                AI Pre-Grading Criteria
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span>Methodology</span>
                                    <span className="font-mono text-indigo-600">30%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-[30%] h-full"></div>
                                </div>
                            </div>
                            <div className="text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span>Analysis</span>
                                    <span className="font-mono text-indigo-600">40%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-[40%] h-full"></div>
                                </div>
                            </div>
                            <div className="text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span>Conclusion</span>
                                    <span className="font-mono text-indigo-600">30%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-[30%] h-full"></div>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 pt-2 italic">
                                * The AI will check your draft against these weights.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

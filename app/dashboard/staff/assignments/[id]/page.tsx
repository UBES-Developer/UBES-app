import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Download,
    Upload,
    Send,
    EyeOff,
    MoreHorizontal,
    FileText,
    Bot
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubmissionViewer } from "@/components/assignments/SubmissionViewer";

export default async function AssignmentGradingPage({ params }: { params: { id: string } }) {
    const { id } = await params;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch Assignment Details
    const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();

    const assignment = assignmentData ? {
        ...assignmentData,
        code: assignmentData.course_module, // Mapping fields
        stats: { submitted: 0, in_marking: 0, graded: 0, released: 0 } // Re-calc below
    } : {
        title: "Assignment Not Found (Using Mock ID?)",
        code: "Unknown",
        total: 100,
        stats: { submitted: 0, in_marking: 0, graded: 0, released: 0 }
    };

    // Fetch Real Submissions with Student Profiles
    const { data: submissionsData } = await supabase
        .from('submissions')
        .select(`
            id,
            status,
            ai_pre_grade_score,
            final_grade,
            content_url,
            student:student_id (
                full_name,
                email
            )
        `)
        .eq('assignment_id', id);

    const submissions = submissionsData?.map(sub => ({
        id: sub.id,
        student: (sub.student as any)?.full_name || (sub.student as any)?.email || "Unknown Student",
        status: sub.status,
        ai_score: sub.ai_pre_grade_score,
        grade: sub.final_grade,
        content_url: sub.content_url
    })) || [];

    // Update Stats
    if (submissions.length > 0) {
        assignment.stats.submitted = submissions.filter(s => s.status === 'submitted').length;
        assignment.stats.in_marking = submissions.filter(s => s.status === 'in_marking').length;
        assignment.stats.graded = submissions.filter(s => s.status === 'graded').length;
        assignment.stats.released = submissions.filter(s => s.status === 'released').length;
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl space-y-6">

            {/* Header with Batch Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{assignment.code}</Badge>
                        <span className="text-slate-500 text-sm">Due: Yesterday</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export CSV (Offline)
                    </Button>
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" /> Import Grades
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Send className="mr-2 h-4 w-4" /> Release All Graded
                    </Button>
                </div>
            </div>

            {/* Workflow Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-50 border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold text-slate-700">{assignment.stats.submitted}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Submitted</div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-100 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold text-amber-700">{assignment.stats.in_marking}</div>
                        <div className="text-xs text-amber-600 uppercase tracking-wider font-semibold">In Marking</div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold text-blue-700">{assignment.stats.graded}</div>
                        <div className="text-xs text-blue-600 uppercase tracking-wider font-semibold">Ready to Release</div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100 shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="text-2xl font-bold text-green-700">{assignment.stats.released}</div>
                        <div className="text-xs text-green-600 uppercase tracking-wider font-semibold">Released</div>
                    </CardContent>
                </Card>
            </div>

            {/* Grading Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle>Submission Queue</CardTitle>
                    <CardDescription>Manage grading workflow and status visibility.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"><Checkbox /></TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>AI Suggestion</TableHead>
                                <TableHead>Final Grade</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell><Checkbox /></TableCell>
                                    <TableCell className="font-medium text-slate-900">
                                        <div className="flex flex-col">
                                            <span>{sub.student}</span>
                                            <div className="mt-1">
                                                <SubmissionViewer
                                                    filePath={sub.content_url}
                                                    studentName={sub.student}
                                                    fileName="Submission.pdf"
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={
                                            sub.status === 'submitted' ? 'bg-slate-100 text-slate-600' :
                                                sub.status === 'in_marking' ? 'bg-amber-100 text-amber-700' :
                                                    sub.status === 'graded' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                        }>
                                            {sub.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-slate-600">
                                            <Bot className="h-4 w-4 text-indigo-500" />
                                            {sub.ai_score}%
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {sub.grade ? (
                                            <span className="font-bold">{sub.grade}%</span>
                                        ) : (
                                            <span className="text-slate-400 italic">--</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>Mark as In Progress</DropdownMenuItem>
                                                <DropdownMenuItem>Enter Grade</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Reopen Submission</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    )
}

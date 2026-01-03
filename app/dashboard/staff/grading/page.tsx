
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
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
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default async function GradingListPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Real Data
    const { data: rawAssignments } = await import("@/app/actions/lecturer").then(m => m.getAllAssignments());

    // Process assignments (which are actually submissions flattened) to group by Assignment Title?
    // Wait, getAllAssignments now returns individual student submissions. 
    // The previous mock was "Grouped by Assignment".
    // I need to group the submissions by assignment_id to show progress.

    const groupedAssignments = rawAssignments?.reduce((acc: any, curr: any) => {
        const id = curr.assignment_id || 'unknown';
        if (!acc[id]) {
            acc[id] = {
                id: curr.assignment_id, // We need actual assignment ID, query didn't return it? 
                // Ah, getAllAssignments returns submissions with `assignments(title...)` joined.
                // It doesn't explicitly return assignment_id in top level if I recall, wait.
                // It returns `*` from submissions, so `assignment_id` is there.
                title: curr.title,
                course: curr.course_code,
                submitted: 0,
                graded: 0,
                due: "N/A" // Submission doesn't have due date, assignment does. 
                // I need to check getAllAssignments select. 
            };
        }
        acc[id].submitted += 1; // Count this submission
        if (curr.grade !== null) acc[id].graded += 1;
        return acc;
    }, {});

    const assignments: any[] = Object.values(groupedAssignments || {});

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grading Stack</h1>
                    <p className="text-slate-500">Assignments pending your review.</p>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Assignment</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Due</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map((assignment: any) => (
                            <TableRow key={assignment.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <BookOpen className="mr-2 h-4 w-4 text-slate-400" />
                                        {assignment.title}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{assignment.course}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${(assignment.graded / assignment.submitted) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">{assignment.graded}/{assignment.submitted}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <Clock className="mr-1 h-3 w-3" /> {assignment.due}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" asChild>
                                        <Link href={`/dashboard/staff/grading/${assignment.id}`}>
                                            Grade <ArrowRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

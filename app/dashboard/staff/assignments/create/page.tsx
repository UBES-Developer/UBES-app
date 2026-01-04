import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { redirect } from "next/navigation";

// This would typically be a server component fetching templates, 
// using a client component for the form state.
// For simplicity in this demo, we'll assume a Server Action handles the submit.

export default async function CreateAssignmentPage() {

    // In a real app, fetch these from DB
    const mockTemplates = [
        { id: '1', name: 'Standard Lab Report (Engineering)' },
        { id: '2', name: 'Research Essay (Humanities)' },
        { id: '3', name: 'Problem Set (Math/Physics)' },
    ];

    async function createAssignmentAction(formData: FormData) {
        "use server";
        // Stub for server action
        console.log("Creating Assignment...");
        // redirect('/dashboard/staff/assignments');
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Assignment</h1>
                <p className="text-slate-500">Deploy a standardized assessment to your cohort.</p>
            </div>

            <form action={createAssignmentAction}>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Assignment Details</CardTitle>
                        <CardDescription>Configure the core settings for this task.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label>Department Template</Label>
                            <Select name="template">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a standard template..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockTemplates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">Templates ensure consistent grading rubrics across the department.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Module Code</Label>
                                <Input name="module" placeholder="e.g. MECH201" />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input name="dueDate" type="datetime-local" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Assignment Title</Label>
                            <Input name="title" placeholder="e.g. Thermodynamics Lab 1" />
                        </div>

                        <div className="space-y-2">
                            <Label>Instructions</Label>
                            <Textarea name="description" placeholder="Provide additional context..." className="min-h-[100px]" />
                        </div>

                    </CardContent>
                </Card>

                <Card className="mt-6 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Continuous Integration Settings</CardTitle>
                        <CardDescription>Configure the Agile learning pipeline.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <h4 className="font-medium text-slate-900">Allow Draft Iterations</h4>
                                <p className="text-sm text-slate-500">Students can submit early drafts for AI pre-validation.</p>
                            </div>
                            <div className="h-6 w-11 bg-indigo-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <h4 className="font-medium text-slate-900">AI Pre-Grading</h4>
                                <p className="text-sm text-slate-500">Generate suggested marks based on the rubric.</p>
                            </div>
                            <div className="h-6 w-11 bg-indigo-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-8 flex justify-end gap-4">
                    <Button variant="outline" type="button">Cancel</Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Deploy Assignment</Button>
                </div>
            </form>
        </div>
    )
}

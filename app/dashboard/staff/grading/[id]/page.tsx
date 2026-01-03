'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    MessageSquare,
    Maximize2,
    Save
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SpeedGraderPage({ params }: { params: { id: string } }) {
    const [score, setScore] = useState(75);
    const [feedback, setFeedback] = useState("");

    // Mock Data
    const student = { name: "Michael Chang", id: "u123456", submitted: "2 days ago" };

    // Feedback Bank
    const quickComments = [
        { id: 'c1', label: 'Citation Needed', text: "Please provide a valid comprehensive citation for this claim following the APA format." },
        { id: 'c2', label: 'Great Analysis', text: "Excellent breakdown of the core concepts here. Well reasoned." },
        { id: 'c3', label: 'Calculation Error', text: "Check your working here. The integration step seems to have missed a constant." },
        { id: 'c4', label: 'Grammar', text: "Please proofread for minor grammatical errors." },
    ];

    const insertComment = (text: string) => {
        setFeedback(prev => prev + (prev ? "\n\n" : "") + text);
    };

    const handleSave = () => {
        toast.success(`Grade saved: ${score}/100`);
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Left: Document Viewer */}
            <div className="flex-1 flex flex-col border-r border-slate-200">
                <div className="h-14 bg-white border-b flex items-center justify-between px-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/staff/grading">
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <div className="text-sm font-medium text-slate-700">
                        {student.name} ({student.id}) • <span className="text-slate-500">Submitted {student.submitted}</span>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Maximize2 className="h-4 w-4 text-slate-500" />
                    </Button>
                </div>

                <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center">
                    <div className="w-full max-w-3xl bg-white shadow-lg min-h-[800px] p-12 text-slate-800">
                        <h1 className="text-2xl font-bold mb-6">The Impact of Reynolds Number on Pipe Flow</h1>
                        <p className="mb-4 text-justify">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <p className="mb-4 text-justify">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </p>
                        <div className="my-8 p-4 bg-slate-50 border border-slate-200 rounded text-center italic text-slate-500">
                            [Figure 1: Laminar vs Turbulent Flow Diagram Placeholder]
                        </div>
                        <p className="mb-4 text-justify">
                            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
                            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Grading Panel */}
            <div className="w-96 bg-white flex flex-col shadow-xl z-10">
                <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                    <h2 className="font-semibold text-slate-800 flex items-center">
                        <Check className="mr-2 h-4 w-4 text-green-600" /> Assessment
                    </h2>
                    <Badge variant="outline" className="bg-white">
                        {score}/100
                    </Badge>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Rubric / Score */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-700">Grade Score</label>
                        <div className="flex items-center space-x-4">
                            <Slider
                                value={[score]}
                                onValueChange={(val) => setScore(val[0])}
                                max={100}
                                step={1}
                                className="flex-1"
                            />
                            <span className="font-mono font-bold w-8 text-right">{score}</span>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" onClick={() => setScore(50)} className="text-xs">Pass (50)</Button>
                            <Button size="sm" variant="outline" onClick={() => setScore(75)} className="text-xs">Good (75)</Button>
                            <Button size="sm" variant="outline" onClick={() => setScore(90)} className="text-xs">Great (90)</Button>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Feedback Bank */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4 text-indigo-500" />
                            Quick Feedback
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {quickComments.map(comment => (
                                <Badge
                                    key={comment.id}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-indigo-100 transition-colors"
                                    onClick={() => insertComment(comment.text)}
                                >
                                    {comment.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Detailed Comments</label>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="h-40 resize-none"
                            placeholder="Enter specific feedback..."
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t bg-slate-50 space-y-2">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Save & Next Student
                    </Button>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Student 14 of 60</span>
                        <span>Next: Sarah Connor</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

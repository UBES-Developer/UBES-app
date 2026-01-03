'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    FileText,
    Calendar,
    GripVertical,
    EyeOff,
    MoreVertical,
    Upload,
    Clock
} from "lucide-react";

interface ContentItem {
    id: string;
    title: string;
    type: string;
    status: string;
    releaseDate?: string;
}

interface Week {
    id: number;
    title: string;
    items: ContentItem[];
}
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function CourseContentPage({ params }: { params: { id: string } }) {
    // Mock Data struct
    const [weeks, setWeeks] = useState<Week[]>([
        {
            id: 1,
            title: "Week 1: Introduction to Fluids",
            items: [
                { id: 'f1', title: "Lecture Slides - Intro", type: "pdf", status: "published" },
                { id: 'f2', title: "Reading List", type: "doc", status: "published" }
            ]
        },
        {
            id: 2,
            title: "Week 2: Viscosity & Laminar Flow",
            items: [
                { id: 'f3', title: "Lab Safety Manual", type: "pdf", status: "published" }
            ]
        },
        {
            id: 3,
            title: "Week 3: Reynolds Number",
            items: [
                { id: 'f4', title: "Mid-Term Practice Quiz", type: "quiz", status: "scheduled", releaseDate: "2024-10-15 09:00" }
            ]
        }
    ]);

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Course Content</h1>
                    <p className="text-slate-500">Fluid Mechanics 201</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Week
                </Button>
            </div>

            <div className="space-y-6 max-w-4xl">
                {weeks.map((week) => (
                    <div key={week.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 flex items-center">
                                <GripVertical className="mr-2 h-4 w-4 text-slate-400 cursor-move" />
                                {week.title}
                            </h3>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-white hover:shadow-sm">
                                        <Plus className="mr-1 h-3 w-3" /> Add Content
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Material to {week.title}</DialogTitle>
                                        <DialogDescription>Upload files or create timed assessments.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input placeholder="e.g. Lecture Slides" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>File Upload</Label>
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-slate-50">
                                                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                                <span className="text-sm text-slate-600">Drag files here or click to browse</span>
                                                <span className="text-xs text-slate-400 mt-1">PDF, DOCX, PPTX up to 50MB</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Timed Release (Optional)</Label>
                                            <div className="flex items-center space-x-2">
                                                <Input type="datetime-local" className="w-[60%]" />
                                                <Badge variant="secondary" className="font-normal text-slate-500">
                                                    <EyeOff className="mr-1 h-3 w-3" /> Hidden until
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Upload Material</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {week.items.map((item) => (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center">
                                        <div className="mr-3 p-2 bg-indigo-50 text-indigo-600 rounded">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">{item.title}</p>
                                            <p className="text-xs text-slate-500 uppercase">{item.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {item.status === 'scheduled' && (
                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                <Clock className="mr-1 h-3 w-3" /> Available: {item.releaseDate}
                                            </Badge>
                                        )}
                                        {item.status === 'published' && (
                                            <Badge variant="secondary" className="text-green-600 bg-green-50">
                                                Published
                                            </Badge>
                                        )}
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {week.items.length === 0 && (
                                <div className="p-8 text-center text-slate-400 italic text-sm">
                                    No items in this week yet.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

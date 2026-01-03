'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Calendar as CalendarIcon, Ban } from "lucide-react";
import { toast } from "sonner";
import { blockResource, scheduleExamMode } from "@/app/actions/admin";

interface Resource {
    id: string;
    name: string;
}

export function FacilityActions({ resources }: { resources: Resource[] }) {
    const [maintenanceOpen, setMaintenanceOpen] = useState(false);
    const [examOpen, setExamOpen] = useState(false);

    async function handleBlock(formData: FormData) {
        try {
            await blockResource(formData);
            toast.success("Resource Blocked for Maintenance");
            setMaintenanceOpen(false);
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    async function handleExam(formData: FormData) {
        try {
            await scheduleExamMode(formData);
            toast.success("Exam Mode Activated");
            setExamOpen(false);
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    return (
        <div className="flex space-x-2">
            {/* Maintenance Dialog */}
            <Dialog open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="bg-amber-600 hover:bg-amber-700 border-amber-800">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Block for Maintenance
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Block Resource</DialogTitle>
                        <DialogDescription>Mark a facility as out of order.</DialogDescription>
                    </DialogHeader>
                    <form action={handleBlock} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Resource</Label>
                            <Select name="resource_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select facility" />
                                </SelectTrigger>
                                <SelectContent>
                                    {resources.map(r => (
                                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start</Label>
                                <Input type="datetime-local" name="start_time" required />
                            </div>
                            <div className="space-y-2">
                                <Label>End estimated</Label>
                                <Input type="datetime-local" name="end_time" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input name="reason" placeholder="e.g. Broken Projector" required />
                        </div>
                        <DialogFooter>
                            <Button type="submit" variant="destructive">Block Now</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Exam Mode Dialog */}
            <Dialog open={examOpen} onOpenChange={setExamOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Exam Mode
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate Exam Mode</DialogTitle>
                        <DialogDescription>
                            This will override ALL existing student bookings for the selected time range.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleExam} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Exam Title</Label>
                            <Input name="title" placeholder="e.g. Physics Midterm" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start</Label>
                                <Input type="datetime-local" name="start_time" required />
                            </div>
                            <div className="space-y-2">
                                <Label>End</Label>
                                <Input type="datetime-local" name="end_time" required />
                            </div>
                        </div>
                        <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Warning: Students will be notified of cancellation.
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-red-600 hover:bg-red-700">Confirm Override</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

'use client';

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { updateGrade } from "@/app/actions/lecturer";
import { PenTool } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed or use default alert

export default function GradingDialog({ assignment }: { assignment: any }) {
    const [open, setOpen] = useState(false);
    const [grade, setGrade] = useState(assignment.grade || "");
    const [feedback, setFeedback] = useState(assignment.feedback || "");
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        setLoading(true);
        const result = await updateGrade(assignment.id, Number(grade), feedback);
        setLoading(false);

        if (result.error) {
            alert("Error saving grade: " + result.error);
        } else {
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    {assignment.grade ? "Edit" : "Grade"}
                    <PenTool className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Grade Assignment</DialogTitle>
                    <DialogDescription>
                        Enter grade and feedback for {assignment.profiles?.full_name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="grade" className="text-right">
                            Grade (%)
                        </Label>
                        <Input
                            id="grade"
                            type="number"
                            min="0"
                            max="100"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="feedback" className="text-right">
                            Feedback
                        </Label>
                        <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="col-span-3"
                            placeholder="Great work, but..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

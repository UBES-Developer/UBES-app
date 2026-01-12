'use client';

import { useState } from "react";
import { format } from "date-fns";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBooking } from "@/app/actions/admin";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

interface Resource {
    id: string;
    name: string;
    type: string;
    location?: string;
}

interface BookingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resource: Resource | null;
    initialStart: Date | null;
    onSuccess?: () => void;
}

export function BookingDialog({ open, onOpenChange, resource, initialStart, onSuccess }: BookingDialogProps) {
    // ... (state and helpers unchanged) 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Default duration: 1 hour
    const defaultEnd = initialStart ? new Date(initialStart.getTime() + 60 * 60 * 1000) : null;

    // Helper to format date for input type="datetime-local" (YYYY-MM-DDTHH:mm)
    const toInputString = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        // ... (submit logic unchanged)
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        
        // Validation: Start < End
        const start = formData.get("start") as string;
        const end = formData.get("end") as string;
        if (new Date(start) >= new Date(end)) {
            setError("End time must be after start time.");
            setLoading(false);
            return;
        }

        const res = await createBooking(formData);

        if (res?.error) {
            setError(res.error);
            if (!res.error.includes("CLASH")) {
                toast.error(res.error);
            }
        } else {
            toast.success("Booking confirmed!");
            onOpenChange(false);
            if (onSuccess) onSuccess();
        }
        setLoading(false);
    };

    if (!resource || !initialStart) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book {resource.name}</DialogTitle>
                    <DialogDescription>
                        Schedule a session for this facility.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <input type="hidden" name="resourceId" value={resource.id} />

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Facility
                        </Label>
                        <div className="col-span-3 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                            {resource.name}
                            {resource.location && <span className="text-slate-500 font-normal ml-2">({resource.location})</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Class/Event
                        </Label>
                        <Input id="title" name="title" placeholder="e.g. Flight Dynamics 101" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">
                            Start
                        </Label>
                        <Input 
                            id="start" 
                            name="start" 
                            type="datetime-local" 
                            defaultValue={toInputString(initialStart)}
                            className="col-span-3" 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">
                            End
                        </Label>
                        <Input 
                            id="end" 
                            name="end" 
                            type="datetime-local" 
                            defaultValue={defaultEnd ? toInputString(defaultEnd) : ""}
                            className="col-span-3" 
                            required 
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select name="type" defaultValue="booking">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="booking">Class / Standard Booking</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="exam">Exam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2 text-sm mt-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold">Booking Conflict</p>
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Confirming..." : "Confirm Booking"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

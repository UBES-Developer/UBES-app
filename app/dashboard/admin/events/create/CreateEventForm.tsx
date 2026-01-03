'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createEvent } from "@/app/actions/admin";
import { toast } from "sonner";
import { Calendar, MapPin, QrCode, Bell } from "lucide-react";

export default function CreateEventForm() {
    const handleSubmit = async (formData: FormData) => {
        try {
            await createEvent(formData);
            toast.success("Event Created Successfully!");
            // Reset form or redirect logic here
        } catch (error) {
            toast.error("Failed to create event");
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 rounded-lg border shadow-sm">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" placeholder="e.g. Graduation Ceremony" required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Event details..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Start Time</Label>
                        <Input type="datetime-local" name="start_time" required />
                    </div>
                    <div className="grid gap-2">
                        <Label>End Time</Label>
                        <Input type="datetime-local" name="end_time" required />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input id="location" name="location" className="pl-9" placeholder="Main Hall" required />
                    </div>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                    <Checkbox id="generate_qr" name="generate_qr" />
                    <Label htmlFor="generate_qr" className="flex items-center cursor-pointer">
                        <QrCode className="mr-2 h-4 w-4 text-indigo-500" /> Generate Check-in QR Code
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="send_reminder" name="send_reminder" />
                    <Label htmlFor="send_reminder" className="flex items-center cursor-pointer">
                        <Bell className="mr-2 h-4 w-4 text-amber-500" /> Send Reminder (1hr Before)
                    </Label>
                </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Calendar className="mr-2 h-4 w-4" /> Schedule Event
            </Button>
        </form>
    );
}

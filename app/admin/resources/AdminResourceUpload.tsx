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
import { Plus, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { adminUploadResource } from "@/app/actions/admin";

export function AdminResourceUpload() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            // Mock File Upload: In a real app, we would upload 'file' to Supabase Storage here
            const file = formData.get('file') as File;
            if (file && file.size > 0) {
                // Simulate upload delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Set a fake URL for now since we don't have storage bucket keys
                formData.set('file_url', `https://storage.ubes.edu/resources/${file.name}`);
            } else {
                formData.set('file_url', '#');
            }

            // Clean up FormData before sending to server action if needed, 
            // but Admin Action expects file_url, so we just ensured it's set.

            await adminUploadResource(formData);
            toast.success("Resource Uploaded & Approved");
            setOpen(false);
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Upload Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Admin Resource</DialogTitle>
                    <DialogDescription>
                        Directly add verified academic materials. These will be instantly approved.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Resource Title</Label>
                        <Input id="title" name="title" placeholder="e.g. Advanced Calculus Notes" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="course">Course</Label>
                            <Input id="course" name="course_code" placeholder="MATH301" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="module">Year/Level</Label>
                            <Input id="module" name="module" placeholder="Year 3" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resource_type">Type</Label>
                        <Input id="resource_type" name="resource_type" placeholder="e.g. Lecture Notes, Past Paper" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">File Attachment</Label>
                        <div className="flex items-center gap-2">
                            <Input id="file" name="file" type="file" className="cursor-pointer" required />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Uploading..." : "Upload & Publish"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Check, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { approveResource, rejectResource } from "@/app/actions/admin";

interface Resource {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    file_url: string;
    course_code: string;
    module: string;
    uploaded_by: string;
    created_at: string;
}

export default function VettingTable({ resources }: { resources: Resource[] }) {
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [open, setOpen] = useState(false);

    const handleView = (resource: Resource) => {
        setSelectedResource(resource);
        setIsRejecting(false);
        setRejectionReason("");
        setOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedResource) return;
        try {
            await approveResource(selectedResource.id);
            toast.success("Resource Approved");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to approve resource");
        }
    };

    const handleReject = async () => {
        if (!selectedResource) return;
        if (!isRejecting) {
            setIsRejecting(true);
            return;
        }
        if (!rejectionReason) {
            toast.error("Please provide a reason");
            return;
        }
        try {
            await rejectResource(selectedResource.id, rejectionReason);
            toast.success("Resource Rejected");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to reject resource");
        }
    };

    return (
        <>
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No pending resources.
                                </TableCell>
                            </TableRow>
                        ) : (
                            resources.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <FileText className="mr-2 h-4 w-4 text-slate-400" />
                                            {res.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{res.resource_type}</Badge>
                                    </TableCell>
                                    <TableCell>{res.course_code}</TableCell>
                                    <TableCell>{new Date(res.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleView(res)}>
                                            <Eye className="h-4 w-4 mr-2" /> Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Review Resource</DialogTitle>
                        <DialogDescription>
                            {selectedResource?.title} • {selectedResource?.course_code}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 bg-slate-100 rounded-md overflow-hidden border">
                        {selectedResource?.file_url ? (
                            <iframe
                                src={selectedResource.file_url}
                                className="w-full h-full"
                                title="Resource Preview"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                No preview available
                            </div>
                        )}
                    </div>

                    {isRejecting && (
                        <div className="mt-4 space-y-2">
                            <Label>Rejection Reason</Label>
                            <Textarea
                                placeholder="Why is this resource being rejected?"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    )}

                    <DialogFooter className="mt-4 gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            variant={isRejecting ? "destructive" : "secondary"}
                            onClick={handleReject}
                        >
                            <X className="mr-2 h-4 w-4" /> {isRejecting ? "Confirm Rejection" : "Reject"}
                        </Button>
                        {!isRejecting && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

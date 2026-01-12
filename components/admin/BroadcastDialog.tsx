'use client';

import { useState } from "react";
import { createBroadcast } from "@/app/actions/admin";
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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Megaphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BroadcastDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as 'info' | 'warning' | 'critical' | 'success',
        targetRole: 'all'
    });

    async function handleSubmit() {
        if (!formData.title || !formData.message) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        const res = await createBroadcast(formData.title, formData.message, formData.type, formData.targetRole);
        setLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Broadcast sent successfully");
            setOpen(false);
            setFormData({ title: '', message: '', type: 'info', targetRole: 'all' });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <Megaphone className="mr-2 h-4 w-4" /> Broadcast
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Send System Broadcast</DialogTitle>
                    <DialogDescription>
                        This message will be visible to all users on their dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input 
                            id="title" 
                            className="col-span-3" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="info">Info (Blue)</SelectItem>
                                <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                <SelectItem value="critical">Critical (Red)</SelectItem>
                                <SelectItem value="success">Success (Green)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Target</Label>
                        <Select value={formData.targetRole} onValueChange={(v) => setFormData({...formData, targetRole: v})}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Everyone</SelectItem>
                                <SelectItem value="student">Students</SelectItem>
                                <SelectItem value="lecturer">Lecturers</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="message" className="text-right">Message</Label>
                        <Textarea 
                            id="message" 
                            className="col-span-3" 
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Broadcast"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

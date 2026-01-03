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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Search, UserPlus, Clock, X } from "lucide-react";
import { searchStaff, requestConsultation } from "@/app/actions/student";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StaffProfile {
    id: string;
    full_name: string;
    avatar_url: string;
    department: string;
    position: string;
}

export function ConsultationRequestDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'search' | 'booking'>('search');
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<StaffProfile[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
    const [loading, setLoading] = useState(false);

    // Booking Form
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const data = await searchStaff(searchQuery);
            setResults(data as StaffProfile[]);
        } catch (err) {
            console.error(err);
            toast.error("Failed to search staff");
        } finally {
            setLoading(false);
        }
    };

    const selectStaff = (staff: StaffProfile) => {
        setSelectedStaff(staff);
        setStep('booking');
    };

    const handleSubmit = async () => {
        if (!date || !time || !reason || !selectedStaff) {
            toast.error("Please fill in all fields");
            return;
        }

        const dateTime = `${date}T${time}:00`;
        setLoading(true);
        try {
            await requestConsultation(selectedStaff.id, dateTime, reason);
            toast.success("Consultation requested successfully!");
            setOpen(false);
            // Reset
            setStep('search');
            setSelectedStaff(null);
            setReason("");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Request Consultation
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Book Consultation</DialogTitle>
                    <DialogDescription>
                        {step === 'search'
                            ? "Find a lecturer or staff member to meet with."
                            : `Schedule a time with ${selectedStaff?.full_name}`
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 'search' ? (
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search by name, department, or position..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button size="icon" onClick={handleSearch} disabled={loading}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {results.length === 0 && searchQuery && !loading && (
                                <p className="text-center text-sm text-slate-500 py-4">No staff found.</p>
                            )}
                            {results.map((staff) => (
                                <div key={staff.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => selectStaff(staff)}>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={staff.avatar_url} />
                                            <AvatarFallback>{staff.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900">{staff.full_name}</p>
                                            <p className="text-xs text-slate-500">{staff.position} • {staff.department}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost">Select</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback>{selectedStaff?.full_name?.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-indigo-900">{selectedStaff?.full_name}</span>
                            <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0" onClick={() => setStep('search')}>
                                <X className="h-4 w-4 text-indigo-400" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason for meeting</Label>
                            <Input placeholder="e.g. Project help, Grade enquiry..." value={reason} onChange={(e) => setReason(e.target.value)} />
                        </div>
                    </div>
                )}

                <DialogFooter>
                    {step === 'booking' && (
                        <div className="flex gap-2 w-full">
                            <Button variant="outline" onClick={() => setStep('search')} className="flex-1">Back</Button>
                            <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                {loading ? "Booking..." : "Confirm Request"}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

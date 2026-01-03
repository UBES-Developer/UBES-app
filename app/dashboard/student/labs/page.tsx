'use client';

import { useState, useEffect } from "react";
import { getLabResources, createBooking, getMyBookings } from "@/app/actions/labs";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Filter, Clock, Calendar as CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function StudentLabsPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    // Booking State
    const [selectedResource, setSelectedResource] = useState<any>(null);
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [purpose, setPurpose] = useState("");
    const [bookingOpen, setBookingOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [filter]);

    async function loadData() {
        setLoading(true);
        const [resParams, bookParams] = await Promise.all([
            getLabResources(filter),
            getMyBookings()
        ]);

        if (resParams.data) setResources(resParams.data);
        if (bookParams.data) setBookings(bookParams.data);
        setLoading(false);
    }

    async function handleBook() {
        if (!selectedResource || !bookingDate || !startTime || !endTime) return;

        // Construct ISO strings
        const startISO = `${bookingDate}T${startTime}:00`;
        const endISO = `${bookingDate}T${endTime}:00`;

        const res = await createBooking(selectedResource.id, startISO, endISO, purpose);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Booking requested successfully!");
            setBookingOpen(false);
            setBookingDate("");
            setStartTime("09:00");
            setEndTime("10:00");
            setPurpose("");
            loadData();
        }
    }

    // Common tags for filter suggestions
    const commonTags = ["AutoCAD", "Microscope", "3D Printer", "Soldering", "Computers"];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Lab Booking</h1>
                    <p className="text-gray-500 mt-1">Reserve equipment and workspaces.</p>
                </div>

                {/* FILTERS */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filter Equipment:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge
                            variant={filter === '' ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setFilter('')}
                        >
                            All
                        </Badge>
                        {commonTags.map(tag => (
                            <Badge
                                key={tag}
                                variant={filter === tag ? 'default' : 'outline'}
                                className="cursor-pointer hover:bg-slate-100"
                                onClick={() => setFilter(tag)}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* RESOURCES GRID */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><FlaskConical className="h-5 w-5" /> Available Resources</h2>
                        <BentoGrid className="md:grid-cols-2">
                            {resources.map(res => (
                                <BentoCard key={res.id} variant="glass" className="hover:scale-[1.02] transition-transform">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">{res.name}</h3>
                                        <Badge variant="secondary" className="capitalize">{res.type}</Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-4 h-10 line-clamp-2">{res.description}</div>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {res.equipment?.map((eq: string) => (
                                            <span key={eq} className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-600 border border-slate-200">
                                                {eq}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="text-xs text-gray-400">{res.location}</div>
                                        <Button size="sm" onClick={() => { setSelectedResource(res); setBookingOpen(true); }}>
                                            Book Now
                                        </Button>
                                    </div>
                                </BentoCard>
                            ))}
                            {resources.length === 0 && !loading && (
                                <div className="col-span-full py-12 text-center text-gray-400">
                                    <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No matching resources found.</p>
                                </div>
                            )}
                        </BentoGrid>
                    </div>

                    {/* MY BOOKINGS */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5" /> My Bookings</h2>
                        <div className="space-y-3">
                            {bookings.map(b => (
                                <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-semibold text-sm">{b.resource?.name}</div>
                                        <Badge
                                            variant={b.status === 'approved' ? 'default' : b.status === 'pending' ? 'secondary' : 'destructive'}
                                            className={`text-[10px] ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : ''}`}
                                        >
                                            {b.status}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                        <CalendarIcon className="h-3 w-3" />
                                        {new Date(b.start_time).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(b.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && <div className="text-sm text-gray-400 text-center py-4">No bookings yet.</div>}
                        </div>
                    </div>
                </div>

                {/* BOOKING MODAL */}
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Book {selectedResource?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                                </div>
                            </div>
                            <div className="text-xs text-yellow-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Max duration: 3 hours
                            </div>
                            <div className="space-y-2">
                                <Label>Purpose</Label>
                                <Textarea
                                    placeholder="e.g. Completing Assignment 2"
                                    value={purpose}
                                    onChange={e => setPurpose(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleBook}>Confirm Booking</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

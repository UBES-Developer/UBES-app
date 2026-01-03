'use client';

import { useState, useEffect } from "react";
import { createLabResource, getAllBookings, updateBookingStatus } from "@/app/actions/labs";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function StaffLabsPage() {
    const [name, setName] = useState("");
    const [type, setType] = useState<'lab' | 'equipment' | 'room'>('lab');
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        const { data } = await getAllBookings();
        if (data) setBookings(data);
    }

    async function handleCreateResource() {
        if (!name) return;
        setLoading(true);
        await createLabResource(name, type, description, capacity ? parseInt(capacity) : undefined, location);
        setLoading(false);
        setName("");
        setDescription("");
        setCapacity("");
        setLocation("");
    }

    async function handleApprove(id: string) {
        await updateBookingStatus(id, 'approved');
        loadBookings();
    }

    async function handleReject(id: string) {
        await updateBookingStatus(id, 'rejected');
        loadBookings();
    }

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const approvedBookings = bookings.filter(b => b.status === 'approved');

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Lab Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage resources and approve booking requests</p>
                </div>

                {/* Stats */}
                <BentoGrid className="md:grid-cols-3">
                    <BentoCard variant="gradient" className="hover:scale-105 bg-gradient-to-br from-yellow-400/20 to-orange-400/20">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/20 rounded-2xl">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-yellow-600">{pendingBookings.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Pending Requests</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/20 rounded-2xl">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-green-600">{approvedBookings.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Approved</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <FlaskConical className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-purple-600">{bookings.length}</div>
                                <div className="text-sm text-gray-600 mt-1">Total Bookings</div>
                            </div>
                        </div>
                    </BentoCard>
                </BentoGrid>

                <BentoGrid className="md:grid-cols-2">
                    {/* Add Resource Card */}
                    <BentoCard variant="gradient" className="bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-2xl">
                                    <FlaskConical className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Add Lab Resource</h3>
                                    <p className="text-xs text-gray-600">Create new labs, equipment, or rooms</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mechanical Lab 1" className="bg-white/80" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={type} onValueChange={(v) => setType(v as any)}>
                                            <SelectTrigger className="bg-white/80">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lab">Lab</SelectItem>
                                                <SelectItem value="equipment">Equipment</SelectItem>
                                                <SelectItem value="room">Room</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Capacity</Label>
                                        <Input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="30" className="bg-white/80" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Building A, Floor 2" className="bg-white/80" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Details..."
                                        className="h-20 bg-white/80"
                                    />
                                </div>

                                <Button className="w-full h-12 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white" onClick={handleCreateResource} disabled={loading}>
                                    {loading ? 'Creating...' : 'Add Resource'}
                                </Button>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Booking Requests Card */}
                    <BentoCard variant="dark">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5 text-yellow-400" />
                            <h3 className="font-semibold text-lg">Booking Requests ({pendingBookings.length})</h3>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {pendingBookings.map((booking) => (
                                <div key={booking.id} className="p-4 bg-white/10 rounded-2xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold">{booking.resource?.name}</div>
                                            <div className="text-xs text-gray-400">{booking.user?.full_name}</div>
                                        </div>
                                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400">Pending</Badge>
                                    </div>
                                    <div className="text-sm text-gray-300 mb-3">
                                        <div>{new Date(booking.start_time).toLocaleString()}</div>
                                        <div className="italic text-xs mt-1">"{booking.purpose}"</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex-1" onClick={() => handleApprove(booking.id)}>
                                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                        </Button>
                                        <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1" onClick={() => handleReject(booking.id)}>
                                            <XCircle className="h-3 w-3 mr-1" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {pendingBookings.length === 0 && (
                                <div className="text-center text-gray-400 py-12">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No pending requests</p>
                                </div>
                            )}
                        </div>
                    </BentoCard>
                </BentoGrid>
            </div>
        </div>
    );
}

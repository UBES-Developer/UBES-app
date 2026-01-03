
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, MapPin, Users, Wifi, CalendarCheck, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function ManageClassroomsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Mock Fetch - Replace with real Supabase query later
    // const { data: classrooms } = await supabase.from('classroom_resources').select('*');
    const classrooms = [
        { id: 'c1', name: 'Lecture Hall 101', capacity: 200, location: 'Building A, Ground Floor', facilities: ['Projector', 'Microphone', 'AC'], status: 'Available' },
        { id: 'c2', name: 'Seminar Room 2B', capacity: 30, location: 'Building B, 2nd Floor', facilities: ['Whiteboard', 'TV Screen'], status: 'Booked' },
        { id: 'c3', name: 'Classroom 305', capacity: 50, location: 'Building C, 3rd Floor', facilities: ['Projector'], status: 'Available' },
    ];

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Classrooms</h1>
                    <p className="text-slate-500">View availability and book teaching spaces.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="mr-2 h-4 w-4" /> Book Classroom
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Quick Booking</DialogTitle>
                            <DialogDescription>Reserve a classroom for an ad-hoc session.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Select Room</Label>
                                <Input placeholder="e.g. Lecture Hall 101" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="time" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Confirm Booking</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters or Stats could go here */}

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Room Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Facilities</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classrooms.map((room) => (
                            <TableRow key={room.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        <Building className="mr-2 h-4 w-4 text-slate-400" />
                                        {room.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <MapPin className="mr-1 h-3 w-3" /> {room.location}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <Users className="mr-1 h-3 w-3" /> {room.capacity}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {room.facilities.map((fac, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                {fac}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {room.status === 'Available' ? (
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                            Available
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
                                            {room.status}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-slate-50">
                                        Schedule
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

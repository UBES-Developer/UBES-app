import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus } from 'lucide-react';
import { DeleteButton } from '@/app/admin/components/delete-button';
import { deleteEvent } from '@/app/actions/admin';
import { EventForm } from './event-form';

export default async function AdminEventsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: events } = await supabase.from('events').select('*').order('start_time', { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events</h1>
                    <p className="text-gray-500 mt-2">Manage school events and RSVPs.</p>
                </div>
                <EventForm />
            </div>

            <div className="bg-white rounded-md border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Attendees</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!events || events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                    No events scheduled.
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium">{event.title}</TableCell>
                                    <TableCell>{new Date(event.start_time).toLocaleDateString()}</TableCell>
                                    <TableCell>{event.location || 'TBA'}</TableCell>
                                    <TableCell>General</TableCell>
                                    <TableCell>{event.attendees_count || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4 text-gray-500" />
                                            </Button>
                                            <DeleteButton id={event.id} action={deleteEvent} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
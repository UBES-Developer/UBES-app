'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Database } from '@/types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

const MOCK_EVENTS: Event[] = [
    { id: 1, created_at: new Date().toISOString(), title: 'Intro to Machine Learning Workshop', date: new Date('2023-10-28T14:00:00').toISOString(), location: 'Room 304, Engineering Building', category: 'Workshop', attendees_count: 45, description: null },
    { id: 2, created_at: new Date().toISOString(), title: 'Engineering Career Fair', date: new Date('2023-11-05T10:00:00').toISOString(), location: 'Main Hall', category: 'Career Fair', attendees_count: 200, description: null },
    { id: 3, created_at: new Date().toISOString(), title: 'Robotics Club Weekly Meeting', date: new Date('2023-10-30T17:00:00').toISOString(), location: 'Robotics Lab', category: 'Club Meeting', attendees_count: 15, description: null },
    { id: 4, created_at: new Date().toISOString(), title: 'Guest Lecture: Sustainable Energy', date: new Date('2023-11-02T11:00:00').toISOString(), location: 'Auditorium A', category: 'Guest Lecture', attendees_count: 80, description: null },
    { id: 5, created_at: new Date().toISOString(), title: 'Hackathon: Smart Campus', date: new Date('2023-11-10T09:00:00').toISOString(), location: 'Innovation Hub', category: 'Hackathon', attendees_count: 120, description: null },
];

export async function getEvents() {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });

        if (error || !data) {
            console.warn('Supabase error or no data, falling back to mock data:', error);
            throw new Error('Fallback to mock');
        }

        return data as Event[];
    } catch (e) {
        return MOCK_EVENTS;
    }
}

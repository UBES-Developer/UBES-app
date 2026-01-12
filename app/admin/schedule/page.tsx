
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { FacilityActions } from "./FacilityActions";
import { DateNavigator } from "@/components/admin/schedule/DateNavigator";
import { ResourceFilter } from "@/components/admin/schedule/ResourceFilter";
import { ScheduleBuilder } from "@/components/admin/schedule/ScheduleBuilder";
import { startOfDay, endOfDay, parseISO } from "date-fns";

interface PageProps {
    searchParams: { date?: string; filter?: string };
}

export default async function FacilityMasterSchedule({ searchParams }: PageProps) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const dateStr = searchParams.date || new Date().toISOString().split('T')[0];
    const date = parseISO(dateStr);
    const filter = searchParams.filter || 'all';

    // 1. Fetch Resources
    let query = supabase.from('lab_resources').select('*');
    if (filter !== 'all') {
        query = query.eq('type', filter);
    }
    const { data: resources } = await query;

    // 2. Fetch Bookings for the day
    // We want bookings that overlap with this day: start < endOfDay AND end > startOfDay
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();

    const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .or(`start_time.lt.${dayEnd},end_time.gt.${dayStart}`) // Overlap logic not perfect in Supabase syntax, let's simplify
        // Supabase .or() with ranges is tricky. simpler: get all bookings for involved resources and filter in JS if volume is low, 
        // OR better: use >= startOfDay AND <= endOfDay for start_time (catches most)
        // A robust overlap query in PostgREST is: start_time < dayEnd & end_time > dayStart
        // simpler: let's fetch for the specific date window
        .gte('end_time', dayStart)
        .lte('start_time', dayEnd);

    // If bookings is null, default to empty
    const safeBookings = bookings || [];

    // Filter bookings to only those for the fetched resources
    const resourceIds = new Set((resources || []).map(r => r.id));
    const relevantBookings = safeBookings.filter(b => resourceIds.has(b.resource_id));

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Master Schedule</h1>
                    <p className="text-slate-500">Facility utilization timeline.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <DateNavigator />
                    <div className="flex items-center gap-2">
                        <ResourceFilter />
                        <FacilityActions resources={resources || []} />
                    </div>
                </div>
            </div>

            <ScheduleBuilder 
                allResources={resources || []} 
                bookings={relevantBookings} 
                date={date} 
            />

            <div className="flex gap-6 text-xs text-slate-600 border-t pt-4">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded mr-2"></div> 
                    Confirmed Booking
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded mr-2 striped-bg"></div> 
                    Maintenance
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-rose-100 border border-rose-300 rounded mr-2"></div> 
                    Exam / Critical
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-200 border border-red-500 rounded mr-2"></div> 
                    <span className="text-red-600 font-bold">CLASH</span>
                </div>
            </div>
        </div>
    );
}

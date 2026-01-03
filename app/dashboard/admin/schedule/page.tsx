
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, AlertTriangle } from "lucide-react";
import { FacilityActions } from "./FacilityActions";

export default async function FacilityMasterSchedule() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: resources } = await supabase.from('lab_resources').select('*');
    const { data: bookings } = await supabase.from('bookings').select('*').in('resource_id', (resources || []).map(r => r.id));

    // Time slots 08:00 to 18:00
    const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 to 18

    const getBookingsForSlot = (resourceId: string, hour: number) => {
        // Logic to check if booking covers this hour
        // Simplified: start_time hour <= hour < end_time hour
        return bookings?.filter(b => {
            const start = new Date(b.start_time).getHours();
            const end = new Date(b.end_time).getHours();
            return b.resource_id === resourceId && start <= hour && hour < end && b.status !== 'cancelled';
        }) || [];
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Master Schedule</h1>
                    <p className="text-slate-500">Facility utilization and conflict management.</p>
                </div>
                <FacilityActions resources={resources || []} />
            </div>

            <div className="bg-white rounded-lg shadow border overflow-x-auto">
                <div className="min-w-[1000px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 border-b bg-slate-50">
                        <div className="col-span-2 p-4 font-semibold text-slate-700">Resource</div>
                        {hours.map(h => (
                            <div key={h} className="col-span-1 p-4 text-center text-sm font-medium text-slate-500 border-l">
                                {h}:00
                            </div>
                        ))}
                    </div>

                    {/* Resource Rows */}
                    {resources?.map(resource => (
                        <div key={resource.id} className="grid grid-cols-12 border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                            <div className="col-span-2 p-4 border-r flex flex-col justify-center">
                                <span className="font-medium text-slate-900">{resource.name}</span>
                                <span className="text-xs text-slate-500">{resource.location}</span>
                            </div>

                            {/* Time Slots */}
                            {hours.map(h => {
                                const slotBookings = getBookingsForSlot(resource.id, h);
                                const isClash = slotBookings.length > 1;

                                return (
                                    <div key={`${resource.id}-${h}`} className={`col-span-1 border-r relative h-16 ${isClash ? 'bg-red-50' : ''}`}>
                                        {/* Clash Indicator Strip */}
                                        {isClash && (
                                            <div className="absolute top-0 inset-x-0 h-1 bg-red-600 animate-pulse z-20" title="CLASH DETECTED" />
                                        )}

                                        {slotBookings.map((booking, idx) => (
                                            <div
                                                key={booking.id}
                                                className={`absolute inset-x-1 rounded text-[10px] p-1 overflow-hidden leading-tight font-medium border
                                                    ${booking.type === 'maintenance' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 z-10' :
                                                        booking.type === 'exam' ? 'bg-red-100 text-red-700 border-red-200 z-10' :
                                                            'bg-blue-100 text-blue-700 border-blue-200'
                                                    }
                                                `}
                                                style={{
                                                    top: `${4 + (idx * 16)}px`, // Stagger if overlapping 
                                                    height: '24px',
                                                    opacity: isClash ? 0.9 : 1
                                                }}
                                                title={`${booking.type} - User ${booking.user_id}`}
                                            >
                                                {booking.type === 'maintenance' && "🚧 Maint."}
                                                {booking.type === 'booking' && "👤 Booked"}
                                                {booking.type === 'exam' && "📝 Exam"}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {(!resources || resources.length === 0) && (
                        <div className="p-8 text-center text-slate-500">
                            No facilities found.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4 text-sm text-slate-600">
                <div className="flex items-center"><div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-2"></div> Student Booking</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-2"></div> Maintenance</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-2"></div> <span className="text-red-600 font-bold ml-1">RED STRIP</span>: CLASH</div>
            </div>
        </div>
    );
}

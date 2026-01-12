'use client';

import { 
    differenceInMinutes, 
    setHours, 
    setMinutes, 
    startOfDay, 
    format, 
    isSameDay, 
    parseISO 
} from "date-fns";
import { Users, Wrench, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingDialog } from "./BookingDialog";
import { useState } from "react";

interface Booking {
    id: string;
    resource_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    status: string;
    type: string;
}

interface Resource {
    id: string;
    name: string;
    location: string;
    type: string;
}

interface ScheduleTimelineProps {
    resources: Resource[];
    bookings: Booking[];
    date: Date;
    onRemove?: (id: string) => void;
}

export function ScheduleTimeline({ resources, bookings, date, onRemove }: ScheduleTimelineProps) {
    const START_HOUR = 7; // 07:00
    const END_HOUR = 22; // 22:00
    const HOURS_COUNT = END_HOUR - START_HOUR + 1;
    const PIXELS_PER_MINUTE = 1.6; // Width factor
    const PIXELS_PER_HOUR = 60 * PIXELS_PER_MINUTE;
    const TOTAL_WIDTH = HOURS_COUNT * PIXELS_PER_HOUR;

    const [bookingParams, setBookingParams] = useState<{ resource: Resource, time: Date } | null>(null);

    // Helper to get position style
    const getBookingStyle = (booking: Booking) => {
        const start = new Date(booking.start_time);
        const end = new Date(booking.end_time);

        // Normalize to timeline start (07:00 of the day)
        const timelineStart = setHours(startOfDay(date), START_HOUR);
        
        let offsetMinutes = differenceInMinutes(start, timelineStart);
        let durationMinutes = differenceInMinutes(end, start);
        
        // Boundaries check
        if (offsetMinutes < 0) {
            // Started before 07:00, truncate
            durationMinutes += offsetMinutes;
            offsetMinutes = 0;
        }
        
        return {
            left: `${offsetMinutes * PIXELS_PER_MINUTE}px`,
            width: `${Math.max(durationMinutes * PIXELS_PER_MINUTE, 4)}px` // Min width 4px
        };
    };

    const isClash = (b1: Booking, allBookings: Booking[]) => {
        // Simple client-side clash check for visualization
        return allBookings.some(b2 => 
            b1.id !== b2.id && 
            b1.resource_id === b2.resource_id &&
            b1.status !== 'cancelled' && b2.status !== 'cancelled' &&
            new Date(b1.start_time) < new Date(b2.end_time) && 
            new Date(b1.end_time) > new Date(b2.start_time)
        );
    };

    const getBookingColor = (type: string, clash: boolean) => {
        if (clash) return "bg-red-200 text-red-800 border-2 border-red-500 z-20";
        switch (type) {
            case 'maintenance': return "bg-amber-100 text-amber-800 border-amber-300 z-10 striped-bg";
            case 'exam': return "bg-rose-100 text-rose-800 border-rose-300 z-10";
            default: return "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200";
        }
    };

    const handleTimeSlotClick = (e: React.MouseEvent, resource: Resource) => {
        // Prevent triggering if clicking a booking
        if ((e.target as HTMLElement).closest('.absolute.top-2')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        
        // Calculate time
        const minutesFromStart = clickX / PIXELS_PER_MINUTE;
        const clickedTime = setMinutes(setHours(startOfDay(date), START_HOUR), minutesFromStart);
        
        // Round to nearest 30 mins for UX
        const roundedTime = new Date(Math.round(clickedTime.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000));
        
        setBookingParams({ resource, time: roundedTime });
    };

    return (
        <div className="border rounded-md bg-white shadow-sm overflow-hidden flex flex-col h-full w-full"> 
            
            {/* Scrollable Container */}
            <div className="flex-1 overflow-auto relative">
                <div style={{ minWidth: `${TOTAL_WIDTH + 200}px` }}> {/* 200px for sidebar */}
                    
                    {/* Header: Time Ticks */}
                    <div className="sticky top-0 z-30 flex bg-slate-50 border-b h-10">
                        {/* Sticky Corner */}
                        <div className="sticky left-0 w-[200px] flex-shrink-0 bg-slate-100 border-r z-40 flex items-center px-4 font-semibold text-slate-600 shadow-sm">
                            Resource
                        </div>
                        
                        {/* Time Ticks */}
                        <div className="flex relative items-center h-full">
                            {Array.from({ length: HOURS_COUNT }).map((_, i) => {
                                const hour = START_HOUR + i;
                                return (
                                    <div 
                                        key={hour} 
                                        className="absolute text-xs font-medium text-slate-400 border-l border-slate-200 pl-1 h-full flex items-center"
                                        style={{ left: `${i * PIXELS_PER_HOUR}px`, width: `${PIXELS_PER_HOUR}px` }}
                                    >
                                        {hour}:00
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Body: Resource Rows */}
                    <div className="divide-y divide-slate-100">
                        {resources.map((resource) => (
                            <div key={resource.id} className="flex h-20 group relative hover:bg-slate-50/50">
                                
                                {/* Sticky Sidebar Column */}
                                <div className="sticky left-0 w-[200px] flex-shrink-0 bg-white group-hover:bg-slate-50 border-r z-20 flex flex-col justify-center px-4 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] relative">
                                    <div className="flex justify-between items-start">
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-900 truncate" title={resource.name}>{resource.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{resource.location}</p>
                                        </div>
                                        {onRemove && (
                                            <button 
                                                onClick={() => onRemove(resource.id)}
                                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                title="Remove from view"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{resource.type}</span>
                                </div>

                                {/* Timeline Lane */}
                                <div 
                                    className="relative flex-1 h-full bg-grid-pattern cursor-crosshair"
                                    onClick={(e) => handleTimeSlotClick(e, resource)}
                                >
                                    
                                    {/* Hour Grid Lines */}
                                    {Array.from({ length: HOURS_COUNT }).map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="absolute top-0 bottom-0 border-l border-slate-100 border-dashed pointer-events-none"
                                            style={{ left: `${i * PIXELS_PER_HOUR}px` }}
                                        />
                                    ))}

                                    {/* Bookings */}
                                    {bookings
                                        .filter(b => b.resource_id === resource.id && b.status !== 'cancelled')
                                        .map(booking => {
                                            const clash = isClash(booking, bookings);
                                            return (
                                                <div
                                                    key={booking.id}
                                                    className={cn(
                                                        "absolute top-2 bottom-2 rounded px-2 py-1 text-xs font-medium border flex flex-col justify-center overflow-hidden transition-all shadow-sm cursor-pointer",
                                                        getBookingColor(booking.type, clash)
                                                    )}
                                                    style={getBookingStyle(booking)}
                                                    title={`${booking.type} \n${format(new Date(booking.start_time), 'HH:mm')} - ${format(new Date(booking.end_time), 'HH:mm')}`}
                                                >
                                                    <div className="flex items-center gap-1 font-bold leading-none">
                                                        {booking.type === 'maintenance' && <Wrench className="w-3 h-3" />}
                                                        {booking.type === 'exam' && <AlertTriangle className="w-3 h-3" />}
                                                        {clash && <AlertTriangle className="w-3 h-3 text-red-600" />}
                                                        <span className="truncate">{booking.type === 'booking' ? 'Booked' : booking.type}</span>
                                                    </div>
                                                    {parseInt(getBookingStyle(booking).width) > 60 && (
                                                         <div className="text-[10px] opacity-80 truncate leading-none mt-1">
                                                            User {booking.user_id.slice(0, 4)}...
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        ))}
                        
                        {resources.length === 0 && (
                            <div className="p-12 text-center text-slate-400">
                                No facilities match your filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <BookingDialog 
                open={!!bookingParams} 
                onOpenChange={(open) => !open && setBookingParams(null)}
                resource={bookingParams?.resource || null}
                initialStart={bookingParams?.time || null}
            />
        </div>
    );
}

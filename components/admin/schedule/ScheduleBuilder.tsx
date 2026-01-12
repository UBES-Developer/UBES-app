'use client';

import { useState } from 'react';
import { ScheduleTimeline } from './ScheduleTimeline';
import { ResourceBank } from './ResourceBank';
import { DateNavigator } from './DateNavigator';
import { ResourceFilter } from './ResourceFilter';
import { FacilityActions } from '@/app/admin/schedule/FacilityActions';
import { Users } from 'lucide-react';

interface Resource {
    id: string;
    name: string;
    location: string;
    type: string;
}

interface Booking {
    id: string;
    resource_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    status: string;
    type: string;
}

interface ScheduleBuilderProps {
    allResources: Resource[];
    bookings: Booking[];
    date: Date;
}

export function ScheduleBuilder({ allResources, bookings, date }: ScheduleBuilderProps) {
    // Ideally, we start with some active and some in bank.
    // For demo, let's say "Labs" are active by default, others in bank?
    // Or initially ALL active (current behavior) and user can drag back to bank?
    // Let's implement: Active = All initially (as per user mental model of 'Master Schedule').
    // BUT user asked for "Resource Bank... Drop Zone... Dropping a room here adds it as a row."
    // So let's start with EMPTY or Minimal schedule?
    // Let's split: Active = top 3 resources, Bank = rest.
    
    // Initial State Splitting
    const [activeResources, setActiveResources] = useState<Resource[]>(allResources.slice(0, 3)); 
    const [bankResources, setBankResources] = useState<Resource[]>(allResources.slice(3));

    const handleDragStart = (e: React.DragEvent, resource: Resource) => {
        e.dataTransfer.setData('resourceId', resource.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const resourceId = e.dataTransfer.getData('resourceId');
        
        const resource = bankResources.find(r => r.id === resourceId);
        if (resource) {
            // Move from Bank to Active
            setBankResources(prev => prev.filter(r => r.id !== resourceId));
            setActiveResources(prev => [...prev, resource]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    // Remove logic (Double click to remove? or dragging back?)
    // For now, let's just support adding.
    const removeFromSchedule = (id: string) => {
        const resource = activeResources.find(r => r.id === id);
        if (resource) {
            setActiveResources(prev => prev.filter(r => r.id !== id));
            setBankResources(prev => [...prev, resource]);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] border rounded-lg bg-white overflow-hidden shadow-sm">
            {/* Sidebar: Bank */}
            <ResourceBank 
                resources={bankResources} 
                onDragStart={handleDragStart} 
            />

            {/* Main Area: Timeline (Drop Zone) */}
            <div 
                className="flex-1 flex flex-col bg-slate-50 min-w-0"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="p-4 bg-white border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Active Schedule</h2>
                        <p className="text-xs text-slate-500">
                            {activeResources.length} facilities visible • Drop items here to view
                        </p>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-hidden flex flex-col">
                    {activeResources.length > 0 ? (
                        <ScheduleTimeline 
                            resources={activeResources} 
                            bookings={bookings} 
                            date={date}
                            // Pass a remove handler if we want to enable removing from timeline
                            // onRemove={removeFromSchedule} 
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg m-4 bg-slate-50/50">
                            <p className="text-slate-400 font-medium">Drag facilities here to build your view</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

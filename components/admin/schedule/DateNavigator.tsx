'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, subDays, parseISO, startOfToday } from 'date-fns';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn calendar exists or will be added
import { useState } from 'react';

export function DateNavigator() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Parse date from URL or default to today
    const dateParam = searchParams.get('date');
    const currentDate = dateParam ? parseISO(dateParam) : startOfToday();
    const [open, setOpen] = useState(false);

    const updateDate = (newDate: Date) => {
        const params = new URLSearchParams(searchParams);
        params.set('date', format(newDate, 'yyyy-MM-dd'));
        router.push(`?${params.toString()}`);
        setOpen(false); // Close popover on selection
    };

    return (
        <div className="flex items-center space-x-2 bg-white p-1 rounded-md border shadow-sm">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => updateDate(subDays(currentDate, 1))}
                title="Previous Day"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="min-w-[140px] font-medium">
                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                        {format(currentDate, 'EEE, MMM d')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={currentDate}
                        onSelect={(date) => date && updateDate(date)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => updateDate(addDays(currentDate, 1))}
                title="Next Day"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-slate-200 mx-2" />
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => updateDate(startOfToday())}
                className="text-xs text-slate-500"
            >
                Today
            </Button>
        </div>
    );
}

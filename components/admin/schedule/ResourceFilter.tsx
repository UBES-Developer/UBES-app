'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from 'lucide-react';

export function ResourceFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter') || 'all';
    const currentDate = searchParams.get('date');

    const handleFilterChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <Select value={currentFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Filter Facilities" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Facilities</SelectItem>
                    <SelectItem value="lab">Laboratories</SelectItem>
                    <SelectItem value="room">Classrooms</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

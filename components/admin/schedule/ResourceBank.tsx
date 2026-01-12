'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Resource {
    id: string;
    name: string;
    location: string;
    type: string;
}

interface ResourceBankProps {
    resources: Resource[];
    onDragStart: (e: React.DragEvent, resource: Resource) => void;
}

export function ResourceBank({ resources, onDragStart }: ResourceBankProps) {
    return (
        <Card className="h-full border-r rounded-none shadow-none bg-slate-50/50 w-72 flex flex-col">
            <CardHeader className="pb-3 border-b bg-white">
                <CardTitle className="text-sm font-semibold text-slate-700">Facility Bank</CardTitle>
                <p className="text-xs text-slate-500">Drag items to the schedule.</p>
            </CardHeader>
            <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, resource)}
                            className={cn(
                                "flex items-start gap-3 p-3 bg-white rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all group",
                                "hover:shadow-md"
                            )}
                        >
                            <div className="mt-1 text-slate-400 group-hover:text-indigo-400">
                                <GripVertical className="h-4 w-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-900 leading-tight">{resource.name}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{resource.location}</p>
                                <Badge variant="outline" className="mt-2 text-[10px] h-5">
                                    {resource.type}
                                </Badge>
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && (
                        <div className="text-center p-8 text-slate-400 text-xs italic">
                            All facilities are on the schedule.
                        </div>
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
}

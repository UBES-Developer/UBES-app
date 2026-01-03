'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function TranscriptActions() {
    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("Transcript Request Sent!")}>
                Request via Email
            </Button>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
            </Button>
        </div>
    );
}

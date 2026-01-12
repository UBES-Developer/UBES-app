'use client';

import { useState } from "react";
import { createOTPSession } from "@/app/actions/attendance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlayCircle, Loader2 } from "lucide-react";

export function StartAttendanceForm() {
    const [loading, setLoading] = useState(false);
    const [moduleCode, setModuleCode] = useState("");

    async function handleStart() {
        if (!moduleCode) {
            toast.error("Please enter a module code");
            return;
        }
        setLoading(true);
        const res = await createOTPSession(moduleCode);
        if (res.error) {
            toast.error(res.error);
            setLoading(false);
        } else {
            toast.success("Attendance Session Started");
            // Server action revalidates path, so page should reload with active session
        }
    }

    return (
        <div className="flex flex-col gap-4 w-full max-w-sm">
            <Input 
                placeholder="Module Code (e.g. ELEC3005)" 
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
            />
            <Button 
                onClick={handleStart} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 w-full"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                Generate Session Code
            </Button>
        </div>
    );
}

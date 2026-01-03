
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreateEventForm from "./CreateEventForm";

export default function CreateEventPage() {
    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/admin"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Event</h1>
                    <p className="text-slate-500">Schedule campus events and automate notifications.</p>
                </div>
            </div>

            <CreateEventForm />
        </div>
    );
}

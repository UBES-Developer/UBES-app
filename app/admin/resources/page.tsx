
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import VettingTable from "./VettingTable";
// Force recompile
import { AdminResourceUpload } from "./AdminResourceUpload";
import { ShieldCheck } from "lucide-react";

export default async function ResourceVettingScreen() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: resources } = await supabase
        .from('academic_resources')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center">
                    <ShieldCheck className="mr-3 h-8 w-8 text-indigo-600" />
                    The Gatekeeper
                </h1>
                <p className="text-slate-500">Review and vet incoming academic resources.</p>
            </div>

            <div className="flex justify-end">
                <AdminResourceUpload />
            </div>

            <VettingTable resources={resources || []} />
        </div>
    );
}

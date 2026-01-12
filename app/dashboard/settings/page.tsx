
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SettingsHub } from "@/components/settings/SettingsHub";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    
    // Redirect if not logged in
    if (!user) {
        return <div className="p-6">Please log in to view settings.</div>;
    }

    // Fetch profile
    let profile: any = null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    profile = data;

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                    <p className="text-slate-500 text-lg">Manage your profile, preferences, and account security.</p>
                </div>

                <SettingsHub user={user} profile={profile} />
            </div>
        </div>
    );
}

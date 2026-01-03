
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { MFASection } from './mfa-section';
import { User, Bell, Shield, Monitor, Moon, LogOut, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default async function Settings() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    let profile: any = null;

    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profile = data;
    }

    return (
        <div className="space-y-6 max-w-4xl p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                    <p className="text-slate-500">Manage your profile, preferences, and security.</p>
                </div>
            </div>

            <MFASection />

            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-slate-900 flex items-center">
                        <User className="h-5 w-5 mr-2 text-indigo-500" />
                        Profile Information
                    </h2>
                    {/* Note: Save functionality would need a client component form or server action */}
                    <Button size="sm" variant="outline" disabled> <Save className="mr-2 h-4 w-4" /> Save Changes</Button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Button variant="outline">Change Avatar</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input defaultValue={profile?.full_name || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input defaultValue={user?.email || ""} type="email" disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input defaultValue={profile?.role || ""} disabled className="bg-slate-50 capitalize" />
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Input defaultValue={profile?.department || "N/A"} />
                        </div>
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <Input defaultValue={profile?.position || "N/A"} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferences Section (Visual only for now) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-medium text-slate-900 flex items-center">
                        <Monitor className="h-5 w-5 mr-2 text-indigo-500" />
                        App Preferences
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Moon className="h-5 w-5 text-slate-400" />
                            <div>
                                <Label className="text-base font-medium text-slate-900">Dark Mode</Label>
                                <p className="text-sm text-slate-500">Use a dark theme for the interface.</p>
                            </div>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-5 w-5 text-slate-400" />
                            <div>
                                <Label className="text-base font-medium text-slate-900">Notifications</Label>
                                <p className="text-sm text-slate-500">Receive alerts for deadlines and events.</p>
                            </div>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </div>
            {/* Privacy (Clear History) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-medium text-slate-900 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-indigo-500" />
                        Privacy & Data
                    </h2>
                </div>
                <div className="p-6">
                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 justify-start px-0">
                        <LogOut className="h-4 w-4 mr-2" />
                        Clear Chat History
                    </Button>
                </div>
            </div>
        </div>
    );
}

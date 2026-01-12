"use client";

import { useState } from "react";
import { 
    User, 
    Shield, 
    Bell, 
    Moon, 
    Sun, 
    Laptop, 
    Lock, 
    Download, 
    Trash2, 
    Smartphone, 
    Mail, 
    Megaphone,
    Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
    updateNotificationPreferences, 
    updatePrivacySettings, 
    clearChatHistory, 
    toggle2FA, 
    updateProfile,
    exportUserData
} from "@/app/actions/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "@/components/user/ProfileForm";

export function SettingsHub({ user, profile }: { user: any, profile: any }) {
    const [theme, setTheme] = useState("system");
    const [loading, setLoading] = useState(false);
    
    // Hydrate initial state safely
    const [notifications, setNotifications] = useState(profile?.notification_preferences || {
        email_digest: true,
        push_notifications: true,
        class_announcements: true
    });
    
    const [privacy, setPrivacy] = useState(profile?.privacy_settings || {
        profile_visibility: "public",
        show_email: false,
        show_phone: false
    });

    const [mfaEnabled, setMfaEnabled] = useState(profile?.mfa_enabled || false);

    async function handleSaveNotifications() {
        setLoading(true);
        const res = await updateNotificationPreferences(notifications);
        if (res.error) toast.error(res.error);
        else toast.success("Notification preferences saved");
        setLoading(false);
    }

    async function handleSavePrivacy() {
        setLoading(true);
        const res = await updatePrivacySettings(privacy);
        if (res.error) toast.error(res.error);
        else toast.success("Privacy settings saved");
        setLoading(false);
    }

    async function handleToggleMFA(checked: boolean) {
        setLoading(true);
        setMfaEnabled(checked);
        const res = await toggle2FA(checked);
        if (res.error) toast.error(res.error);
        else toast.success(checked ? "2FA Enabled" : "2FA Disabled");
        setLoading(false);
    }

    async function handleClearHistory() {
        if(!confirm("Are you sure? This action cannot be undone.")) return;
        const res = await clearChatHistory();
        if (res.error) toast.error(res.error);
        else toast.success("Chat history cleared");
    }

    async function handleExport() {
        const res = await exportUserData();
        if (res.data) {
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `user-data-${user.id}.json`;
            a.click();
            toast.success("Download started");
        }
    }

    return (
        <div className="space-y-6">
             {/* Sticky Actions Bar if needed, but we put Save inside tabs for context */}
             
            <Tabs defaultValue="general" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <TabsList className="grid w-full sm:w-auto grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>
                    
                    {/* Global Save or Actions could go here */}
                </div>

                {/* GENERAL TAB */}
                <TabsContent value="general" className="space-y-6">
                    {/* Appearance */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Laptop className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-slate-900">Appearance</h2>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Interface Theme</Label>
                                <p className="text-sm text-slate-500">Select your preferred color scheme</p>
                            </div>
                            
                            {/* Segmented Control for Theme */}
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {[
                                    { id: 'light', icon: Sun, label: 'Light' },
                                    { id: 'dark', icon: Moon, label: 'Dark' },
                                    { id: 'system', icon: Laptop, label: 'System' },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setTheme(opt.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                            theme === opt.id 
                                            ? 'bg-white text-slate-900 shadow-sm' 
                                            : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        <opt.icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Profile Information (Existing Form) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                         <div className="flex items-center justify-between gap-2 mb-6">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                             {/* Role - Read Only with Lock */}
                             <div className="grid gap-2">
                                <Label>Role</Label>
                                <div className="relative">
                                    <Input 
                                        value={profile?.role || 'User'} 
                                        disabled 
                                        className="pl-9 bg-slate-50" 
                                    />
                                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-500">Your role is managed by the administrator.</p>
                            </div>

                             {/* Use existing ProfileForm logic but integrated here */}
                             <ProfileForm profile={profile} userEmail={user?.email} />
                        </div>
                    </div>
                </TabsContent>

                {/* SECURITY TAB */}
                <TabsContent value="security" className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
                        </div>

                        <div className="space-y-6">
                            {/* 2FA */}
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <Label className="text-base">Two-Factor Authentication</Label>
                                    <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <Switch checked={mfaEnabled} onCheckedChange={handleToggleMFA} />
                            </div>

                             {/* Session */}
                             <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                <div>
                                    <Label className="text-base">Active Sessions</Label>
                                    <p className="text-sm text-slate-500 mt-1">Manage devices logged into your account.</p>
                                    
                                    <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <Laptop className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Chrome on macOS</p>
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                Active now
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                             {/* Data Export */}
                             <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base">Data Portability</Label>
                                    <p className="text-sm text-slate-500 mt-1">Download a copy of your personal data.</p>
                                </div>
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Data
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6">
                         <div className="flex items-center gap-2 mb-6">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
                        </div>
                         <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base text-red-900">Clear Chat History</Label>
                                    <p className="text-sm text-red-700 mt-1">Permanently delete all your chat messages.</p>
                                </div>
                                <Button variant="destructive" onClick={handleClearHistory}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear History
                                </Button>
                            </div>
                    </div>
                </TabsContent>

                {/* NOTIFICATIONS & PRIVACY TAB */}
                <TabsContent value="notifications" className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                            </div>
                            <Button onClick={handleSaveNotifications} disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <Label className="text-base">Email Digest</Label>
                                        <p className="text-sm text-slate-500">Receive a daily summary of activity.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={notifications.email_digest} 
                                    onCheckedChange={(c) => setNotifications({...notifications, email_digest: c})} 
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <Smartphone className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <Label className="text-base">Push Notifications</Label>
                                        <p className="text-sm text-slate-500">Get real-time alerts on your device.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={notifications.push_notifications} 
                                    onCheckedChange={(c) => setNotifications({...notifications, push_notifications: c})} 
                                />
                            </div>

                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 rounded-lg">
                                        <Megaphone className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <Label className="text-base">Class Announcements</Label>
                                        <p className="text-sm text-slate-500">Important updates from your lecturers.</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={notifications.class_announcements} 
                                    onCheckedChange={(c) => setNotifications({...notifications, class_announcements: c})} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-indigo-500" />
                                <h2 className="text-lg font-semibold text-slate-900">Privacy Settings</h2>
                            </div>
                            <Button onClick={handleSavePrivacy} variant="outline" disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label>Profile Visibility</Label>
                                <Select 
                                    value={privacy.profile_visibility} 
                                    onValueChange={(v) => setPrivacy({...privacy, profile_visibility: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visibility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public (Everyone)</SelectItem>
                                        <SelectItem value="admins">Admins Only</SelectItem>
                                        <SelectItem value="private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-slate-500">Control who can see your basic profile info.</p>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

'use client';

import { useState, useEffect } from "react";
import { getProfile, updateProfile, updatePreferences } from "@/app/actions/settings";
import { checkMFAStatus, enrollMFA, verifyMFA, unenrollMFA } from "@/app/actions/mfa"; // Using Existing MFA actions
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { User, Shield, Bell, Loader2, Save, ScanLine, Smartphone, CheckCircle, AlertTriangle } from "lucide-react"; // Import Icons
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // MFA State
    const [mfaStatus, setMfaStatus] = useState({ enabled: false, factors: [] as any[] });
    const [mfaStep, setMfaStep] = useState<'idle' | 'enrolling' | 'verifying'>('idle');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState('');

    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const { data } = await getProfile();
        if (data) setProfile(data);

        const mfaRes = await checkMFAStatus();
        if (mfaRes.error) {
            console.error(mfaRes.error);
        } else {
            setMfaStatus({ enabled: mfaRes.enabled || false, factors: mfaRes.factors || [] });
        }
        setLoading(false);
    }

    async function handleSaveProfile(formData: FormData) {
        setSaving(true);
        const res = await updateProfile(formData);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated successfully");
            loadData();
        }
        setSaving(false);
    }

    async function handlePreferenceChange(key: string, value: boolean) {
        const newPrefs = { ...profile.preferences, [key]: value };
        // Optimistic update
        setProfile({ ...profile, preferences: newPrefs });

        const res = await updatePreferences(newPrefs);
        if (res.error) {
            toast.error("Failed to update preferences");
            // Revert
            loadData();
        }
    }

    // MFA Handlers
    async function startMFAEnrollment() {
        setMfaStep('enrolling');
        const res = await enrollMFA();
        if (res.error) {
            toast.error(res.error);
            setMfaStep('idle');
        } else {
            setQrCode(res.qrCode!); // Use ! assertion as we expect it
            setFactorId(res.id!);
        }
    }

    async function finishMFAEnrollment() {
        if (!factorId) return;
        const res = await verifyMFA(factorId, verifyCode);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("MFA Enabled Successfully!");
            setMfaStep('idle');
            setQrCode(null);
            setVerifyCode('');
            loadData();
        }
    }

    async function handleDisableMFA() {
        // Just unenroll the first verified factor for simplicity in this demo
        const factor = mfaStatus.factors.find(f => f.status === 'verified');
        if (!factor) return;

        if (confirm("Are you sure you want to disable 2FA? This makes your account less secure.")) {
            const res = await unenrollMFA(factor.id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("MFA Disabled");
                loadData();
            }
        }
    }

    if (loading) {
        return <div className="p-8 flex items-center justify-center h-screen text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account, security, and preferences.</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-3 mb-8">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>

                    {/* 1. PROFILE TAB */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle>
                                <CardDescription>Update your public profile details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={handleSaveProfile} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">Full Name</Label>
                                            <Input id="full_name" name="full_name" defaultValue={profile?.full_name} placeholder="e.g. John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" name="phone" defaultValue={profile?.phone} placeholder="+27 12 345 6789" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea id="bio" name="bio" defaultValue={profile?.bio} placeholder="Tell us a little about yourself..." className="h-32" />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 2. SECURITY TAB (MFA) */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Two-Factor Authentication</CardTitle>
                                <CardDescription>Add an extra layer of security to your account.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${mfaStatus.enabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                                            <LockOpenOrClosed enabled={mfaStatus.enabled} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {mfaStatus.enabled ? "2FA is Active" : "2FA is Disabled"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {mfaStatus.enabled ? "Your account is secure." : "We recommend enabling 2FA."}
                                            </div>
                                        </div>
                                    </div>

                                    {mfaStatus.enabled ? (
                                        <Button variant="destructive" onClick={handleDisableMFA}>Disable</Button>
                                    ) : (
                                        mfaStep === 'idle' && (
                                            <Button onClick={startMFAEnrollment}>Enable 2FA</Button>
                                        )
                                    )}
                                </div>

                                {/* ENROLLMENT FLOW */}
                                {mfaStep === 'enrolling' && qrCode && (
                                    <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                                        <div className="text-center space-y-2">
                                            <h3 className="font-bold text-lg">Scan QR Code</h3>
                                            <p className="text-sm text-gray-600">Use an authenticator app (Google Auth, Authy) to scan this code.</p>
                                        </div>

                                        <div className="flex justify-center bg-white p-4 rounded-lg w-fit mx-auto shadow-sm">
                                            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                        </div>

                                        <div className="max-w-xs mx-auto space-y-4">
                                            <div className="space-y-2">
                                                <Label>Enter Verification Code</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={verifyCode}
                                                        onChange={(e) => setVerifyCode(e.target.value)}
                                                        placeholder="123456"
                                                        className="text-center tracking-widest text-lg font-mono"
                                                        maxLength={6}
                                                    />
                                                </div>
                                            </div>
                                            <Button className="w-full" onClick={finishMFAEnrollment} disabled={verifyCode.length !== 6}>
                                                Verify & Activate
                                            </Button>
                                            <Button variant="ghost" className="w-full text-xs" onClick={() => setMfaStep('idle')}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 3. PREFERENCES TAB */}
                    <TabsContent value="preferences">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</CardTitle>
                                <CardDescription>Manage how we communicate with you.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Email Digest</Label>
                                            <p className="text-sm text-gray-500">Receive a weekly summary of your activity.</p>
                                        </div>
                                        <Switch
                                            checked={profile?.preferences?.email_digest ?? true}
                                            onCheckedChange={(checked) => handlePreferenceChange('email_digest', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Grade Alerts</Label>
                                            <p className="text-sm text-gray-500">Get notified immediately when new grades are posted.</p>
                                        </div>
                                        <Switch
                                            checked={profile?.preferences?.grade_alerts ?? true}
                                            onCheckedChange={(checked) => handlePreferenceChange('grade_alerts', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Forum Replies</Label>
                                            <p className="text-sm text-gray-500">Notify me when someone replies to my posts.</p>
                                        </div>
                                        <Switch
                                            checked={profile?.preferences?.forum_replies ?? true}
                                            onCheckedChange={(checked) => handlePreferenceChange('forum_replies', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function LockOpenOrClosed({ enabled }: { enabled: boolean }) {
    if (enabled) return <Shield className="h-6 w-6 text-green-600" />;
    return <AlertTriangle className="h-6 w-6 text-gray-400" />;
}

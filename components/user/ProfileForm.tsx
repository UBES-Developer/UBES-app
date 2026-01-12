'use client';

import { useState } from "react";
import { updateProfile } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Camera, Save } from "lucide-react";

interface ProfileFormProps {
    profile: any;
    userEmail?: string;
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);

    // Form Handler
    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        // If avatarUrl changed via client upload, we need to make sure the server knows? 
        // Actually, updateProfile action expects form data. 
        // We can append avatar_url to the formData if we update it separately.
        if (avatarUrl !== profile?.avatar_url) {
            formData.append('avatar_url', avatarUrl);
        }

        const res = await updateProfile(formData);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Profile updated successfully");
        }
        setLoading(false);
    }

    // Avatar Upload Handler
    async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            
            setAvatarUrl(data.publicUrl);
            toast.success("Image uploaded. Click 'Save Changes' to persist.");

            // Optional: Auto-save avatar reference? 
            // For now, require user to click Save Changes to update the 'profiles' table.

        } catch (error: any) {
            toast.error("Error uploading avatar: " + error.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24 border-2 border-slate-100">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                            Change Picture
                        </div>
                    </Label>
                    <Input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                    />
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input name="full_name" id="full_name" defaultValue={profile?.full_name || ""} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={userEmail || ""} disabled className="bg-slate-50" />
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea name="bio" id="bio" placeholder="Tell us about yourself..." defaultValue={profile?.bio || ""} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input name="phone" id="phone" type="tel" defaultValue={profile?.phone || ""} />
                </div>

                <div className="space-y-2">
                    <Label>Role</Label>
                    <Input defaultValue={profile?.role || ""} disabled className="bg-slate-50 capitalize" />
                </div>
                
                {/* Read Only Attributes */}
                <div className="space-y-2">
                    <Label>Department</Label>
                    <Input defaultValue={profile?.department || "General"} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                    <Label>Position</Label>
                    <Input defaultValue={profile?.position || "Student"} disabled className="bg-slate-50" />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { signup } from "@/app/actions/auth";
import { BentoCard } from "@/components/bento/BentoCard";
import { UserPlus, Mail, Lock, User, IdCard, Briefcase } from "lucide-react";
import Link from 'next/link';

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        const result = await signup(formData);

        setIsLoading(false);

        if (result?.error) {
            setError(result.error);
        } else if (result?.success) {
            setMessage(result.success as string);
            (event.target as HTMLFormElement).reset();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
            <BentoCard variant="glass" className="w-full max-w-md backdrop-blur-xl">
                <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl mb-4">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-gray-600 mt-2">Join the UBES Portal community</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="flex items-center gap-2 text-gray-900">
                            <User className="h-4 w-4" />
                            Username
                        </Label>
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="johndoe"
                            required
                            minLength={3}
                            className="h-12 bg-white/80 backdrop-blur-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-gray-900">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            className="h-12 bg-white/80 backdrop-blur-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2 text-gray-900">
                            <Lock className="h-4 w-4" />
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="h-12 bg-white/80 backdrop-blur-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="student_id" className="flex items-center gap-2 text-gray-900">
                            <IdCard className="h-4 w-4" />
                            Student ID (Optional)
                        </Label>
                        <Input
                            id="student_id"
                            name="student_id"
                            type="text"
                            placeholder="ST12345"
                            className="h-12 bg-white/80 backdrop-blur-sm"
                        />
                        <p className="text-xs text-gray-500">Required for accessing academic features</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="flex items-center gap-2 text-gray-900">
                            <Briefcase className="h-4 w-4" />
                            I am a...
                        </Label>
                        <Select name="role" defaultValue="student" required>
                            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm">
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="lecturer">Lecturer</SelectItem>
                                <SelectItem value="staff">Staff Member</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Choose the role that best describes you</p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-300 rounded-2xl">
                            <p className="text-sm text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-500/10 border border-green-300 rounded-2xl">
                            <p className="text-sm text-green-700 text-center">{message}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white text-lg rounded-2xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-teal-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </BentoCard>
        </div>
    );
}

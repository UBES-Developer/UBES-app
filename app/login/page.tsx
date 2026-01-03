'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/auth";
import { BentoCard } from "@/components/bento/BentoCard";
import { LogIn, Lock, Mail } from "lucide-react";
import Link from 'next/link';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
            <BentoCard variant="glass" className="w-full max-w-md backdrop-blur-xl">
                <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mb-4">
                        <LogIn className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="flex items-center gap-2 text-gray-900">
                                <Lock className="h-4 w-4" />
                                Password
                            </Label>
                            <Link href="/auth/forgot-password" className="text-xs text-indigo-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="h-12 bg-white/80 backdrop-blur-sm"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-300 rounded-2xl">
                            <p className="text-sm text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg rounded-2xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </BentoCard>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyAndEnableMFA } from "@/app/actions/mfa"; // We can reuse verifyAndEnableMFA or create a specific verifyLoginMFA
// Actually verifyAndEnableMFA uses challengeAndVerify which is correct for login too
import { useRouter } from 'next/navigation';
import { getMFAStatus } from '@/app/actions/mfa';
import { useEffect } from 'react';

export default function VerifyMFAPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [factorId, setFactorId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Fetch the user's factors to get the ID
        // In a real app, we might want to handle multiple factors. For now, take the first verified one.
        async function loadFactor() {
            const status = await getMFAStatus();
            if (status.factors && status.factors.length > 0) {
                const verifiedFactor = status.factors.find((f: any) => f.status === 'verified');
                if (verifiedFactor) {
                    setFactorId(verifiedFactor.id);
                } else {
                    setError("No verified MFA factor found.");
                }
            } else {
                setError("MFA is not enabled.");
            }
        }
        loadFactor();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!factorId) return;

        setLoading(true);
        setError(null);

        const result = await verifyAndEnableMFA(factorId, code);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Success - session is upgraded
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Two-Factor Authentication</CardTitle>
                    <CardDescription className="text-center">
                        Enter the code from your authenticator app to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center">
                            <Input
                                className="text-center text-lg tracking-widest w-40"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <Button type="submit" className="w-full bg-black hover:bg-slate-800" disabled={loading || !factorId}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

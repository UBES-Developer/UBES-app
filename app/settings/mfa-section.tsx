'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { enrollMFA, verifyAndEnableMFA, unenrollMFA, getMFAStatus } from '@/app/actions/mfa';
import Image from 'next/image';

export function MFASection() {
    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [factors, setFactors] = useState<any[]>([]);
    const [enrollmentData, setEnrollmentData] = useState<{ id: string; qrCode: string; secret: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        loadStatus();
    }, []);

    async function loadStatus() {
        setLoading(true);
        const status = await getMFAStatus();
        if (status.error) {
            console.error(status.error);
        } else {
            setEnabled(status.enabled || false);
            setFactors(status.factors || []);
        }
        setLoading(false);
    }

    async function handleEnroll() {
        setError(null);
        const result = await enrollMFA();
        if (result.error) {
            setError(result.error);
        } else {
            setEnrollmentData(result as any);
        }
    }

    async function handleVerify() {
        if (!enrollmentData) return;
        setError(null);

        const result = await verifyAndEnableMFA(enrollmentData.id, verificationCode);
        if (result.error) {
            setError(result.error);
        } else {
            setSuccessMessage("MFA enabled successfully!");
            setEnrollmentData(null);
            setVerificationCode('');
            loadStatus();
        }
    }

    async function handleUnenroll(factorId: string) {
        if (!confirm("Are you sure you want to disable MFA?")) return;

        const result = await unenrollMFA(factorId);
        if (result.error) {
            setError(result.error);
        } else {
            loadStatus();
        }
    }

    if (loading) {
        return <div className="p-6 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Two-Factor Authentication
                </h2>
            </div>
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-sm font-medium text-gray-900">Status</h3>
                    <div className="mt-2 flex items-center">
                        {enabled ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Enabled
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Disabled
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {successMessage}
                    </div>
                )}

                {!enabled && !enrollmentData && (
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-600 mb-4">
                            Protect your account by adding an extra layer of security. When verified, you'll need to enter a code from your mobile app to sign in.
                        </p>
                        <Button onClick={handleEnroll} className="bg-black hover:bg-gray-800 text-white">
                            Enable 2FA
                        </Button>
                    </div>
                )}

                {enrollmentData && (
                    <div className="space-y-4 border-t border-gray-100 pt-4">
                        <p className="text-sm font-medium text-gray-900">1. Scan QR Code</p>
                        <p className="text-sm text-gray-500">Scan this code with your authenticator app (e.g., Google Authenticator).</p>
                        <div className="flex justify-center bg-white p-4 border rounded-md w-fit">
                            <Image src={enrollmentData.qrCode} alt="QR Code" width={150} height={150} />
                        </div>

                        <p className="text-sm font-medium text-gray-900 mt-4">2. Enter Code</p>
                        <div className="flex gap-2 max-w-xs">
                            <Input
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                            <Button onClick={handleVerify} disabled={verificationCode.length < 6}>Verify</Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setEnrollmentData(null)} className="text-gray-500">Cancel</Button>
                    </div>
                )}

                {enabled && factors.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Your account is secured with an authenticator app.
                        </p>
                        {factors.map(factor => (
                            <div key={factor.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                <span className="text-sm font-medium">Authenticator App</span>
                                <Button variant="destructive" size="sm" onClick={() => handleUnenroll(factor.id)}>
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

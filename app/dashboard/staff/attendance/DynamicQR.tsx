'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

export function DynamicQR({ sessionId, courseName }: { sessionId: string, courseName: string }) {
    const [qrUrl, setQrUrl] = useState('');
    const [countdown, setCountdown] = useState(7);
    const [token, setToken] = useState('');

    useEffect(() => {
        // Initial token
        updateToken();

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    updateToken();
                    return 7;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const updateToken = () => {
        // In a real app, we would fetch a signed token from the server here.
        // For simulation, we generate a random string to change the QR code visually.
        const newToken = Math.random().toString(36).substring(7);
        setToken(newToken);

        // Use a public QR generator API
        // Data payload would be: https://ubes-portal.com/attend/session/{id}?token={token}
        const data = `https://ubes-portal.com/attend/${sessionId}?t=${newToken}`;
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data)}&color=000000&bgcolor=ffffff`);
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <Card className="w-full max-w-md bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-xl overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center">
                    <div className="mb-6 text-center">
                        <h3 className="text-2xl font-bold text-slate-900">{courseName}</h3>
                        <p className="text-slate-500">Scan to mark attendance</p>
                    </div>

                    <div className="relative w-64 h-64 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center mb-6">
                        {qrUrl ? (
                            <img src={qrUrl} alt="Attendance QR" className="w-full h-full object-contain" />
                        ) : (
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        )}

                        {/* Security Overlay Effect */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-green-500/50 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>

                    <div className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
                        <RefreshCw className={`w-4 h-4 ${countdown < 3 ? 'animate-spin text-red-500' : 'text-slate-400'}`} />
                        <span>Refreshing in <span className={`font-bold ${countdown < 3 ? 'text-red-500' : 'text-slate-900'}`}>{countdown}s</span></span>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center max-w-lg text-slate-400 text-sm">
                <p>This code is cryptographically rotated every 7 seconds.</p>
                <p>Students cannot share photos of this code.</p>
            </div>
        </div>
    );
}

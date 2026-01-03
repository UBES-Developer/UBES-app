'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Users, Clock, Calendar, CheckCircle } from "lucide-react";
import Image from 'next/image';

export default function LecturerAttendancePage() {
    const [qrCode, setQrCode] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [attendeeCount, setAttendeeCount] = useState(0);

    async function startSession() {
        const sessionData = {
            lectureId: 'lecture-' + Date.now(),
            timestamp: new Date().toISOString(),
            lecturer: 'current-lecturer-id'
        };

        const qr = await QRCode.toDataURL(JSON.stringify(sessionData));
        setQrCode(qr);
        setSessionActive(true);

        // Simulate attendance updates
        const interval = setInterval(() => {
            setAttendeeCount(prev => prev + Math.floor(Math.random() * 3));
        }, 3000);

        setTimeout(() => clearInterval(interval), 30000);
    }

    function endSession() {
        setSessionActive(false);
        setQrCode('');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Attendance Tracking
                    </h1>
                    <p className="text-gray-600 mt-2">Start a session and students can scan to check in</p>
                </div>

                {/* Stats */}
                <BentoGrid className="md:grid-cols-3">
                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-blue-600">{attendeeCount}</div>
                                <div className="text-sm text-gray-600 mt-1">Checked In</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-purple-600">{new Date().toLocaleTimeString()}</div>
                                <div className="text-sm text-gray-600 mt-1">Current Time</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" className="hover:scale-105">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/20 rounded-2xl">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <Badge className={sessionActive ? "bg-green-500/20 text-green-700 border-green-300" : "bg-gray-500/20 text-gray-700 border-gray-300"}>
                                    {sessionActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <div className="text-sm text-gray-600 mt-1">Session Status</div>
                            </div>
                        </div>
                    </BentoCard>
                </BentoGrid>

                {/* QR Code Session */}
                <BentoCard variant="gradient" className="bg-gradient-to-br from-blue-400/20 to-purple-400/20">
                    <div className="text-center space-y-6">
                        {!sessionActive ? (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="p-8 bg-white/40 rounded-3xl border-2 border-dashed border-gray-300">
                                        <QrCode className="h-32 w-32 text-gray-300" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Start Attendance Session</h2>
                                    <p className="text-gray-600 mt-2">Generate a QR code for students to scan</p>
                                </div>
                                <Button
                                    onClick={startSession}
                                    className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg rounded-2xl"
                                >
                                    <QrCode className="h-5 w-5 mr-2" />
                                    Generate QR Code
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-6 bg-white rounded-3xl shadow-2xl inline-block">
                                    <Image src={qrCode} alt="Attendance QR" width={300} height={300} />
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Session Active</h2>
                                    <p className="text-gray-600 mt-2">Students can now scan this QR code to check in</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                                    <div className="p-4 bg-white/60 rounded-2xl">
                                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">Date</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-4 bg-white/60 rounded-2xl">
                                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">Started</span>
                                        </div>
                                        <p className="font-bold text-gray-900">{new Date().toLocaleTimeString()}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={endSession}
                                    variant="outline"
                                    className="h-12 px-8 rounded-2xl border-2"
                                >
                                    End Session
                                </Button>
                            </div>
                        )}
                    </div>
                </BentoCard>
            </div>
        </div>
    );
}

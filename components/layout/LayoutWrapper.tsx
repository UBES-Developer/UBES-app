'use client';

import { usePathname } from 'next/navigation';
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';

    if (isAuthPage) {
        return (
            <div className="flex-1 flex flex-col h-full">
                <main className="flex-1 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-50">
            <Sidebar className="hidden md:flex" />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

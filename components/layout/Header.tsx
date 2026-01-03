'use client';

import { Bell, User } from 'lucide-react';

export default function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center">
                {/* Placeholder for breadcrumbs or page title if needed */}
                <h2 className="text-lg font-semibold text-gray-900">Welcome back, Student</h2>
            </div>
            <div className="flex items-center space-x-4">
                <button className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                </button>
                <div className="relative">
                    <button className="flex items-center rounded-full bg-gray-100 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}

'use client';

import { User } from 'lucide-react';
import { CommandMenu } from './CommandMenu';
import { NotificationsPopover } from './NotificationsPopover';

export default function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                {/* <h2 className="text-lg font-semibold text-gray-900">Welcome</h2> */}
                <CommandMenu />
            </div>
            <div className="flex items-center space-x-4">
                <NotificationsPopover />
                
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

'use client';

import Link from 'next/link';
import { Home, BookOpen, User, Star, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import Sidebar from './layout/Sidebar'; // Re-use sidebar in a sheet for full menu?
// Actually simpler to just have basic nav items for now and maybe a drawer.

export function MobileNav() {
    const pathname = usePathname();
    const { role } = useUserRole();

    const isActive = (path: string) => pathname === path;

    // Do not show on auth pages or admin pages
    if (pathname.startsWith('/auth') || pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname === '/') {
        return null;
    }

    // Determine home link based on role
    let homeLink = '/dashboard/student';
    if (role === 'lecturer') homeLink = '/dashboard/lecturer';
    if (role === 'staff') homeLink = '/dashboard/staff';

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 md:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
            <div className="flex justify-around items-center">
                <Link href={homeLink} className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${isActive(homeLink) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                {/* Assignments / Grading based on role */}
                {role === 'student' && (
                    <Link href="/dashboard/student/assignments" className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${isActive('/dashboard/student/assignments') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>
                        <BookOpen className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Tasks</span>
                    </Link>
                )}
                {role === 'lecturer' && (
                    <Link href="/dashboard/staff/grading" className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${isActive('/dashboard/staff/grading') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>
                        <BookOpen className="h-5 w-5" />
                        <span className="text-[10px] font-medium">Grade</span>
                    </Link>
                )}

                {/* Settings / Profile */}
                <Link href="/settings" className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${isActive('/settings') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500'}`}>
                    <User className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>

                {/* More / Menu Drawer */}
                {/* Ideally we put the full Sidebar in a Sheet here for "More" */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="flex flex-col items-center space-y-1 p-2 rounded-lg text-slate-500">
                            <Menu className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 bg-black border-r-gray-800">
                        {/* We reuse the sidebar content logic or just render the component if it handles its own internal layout nicely */}
                        <div className="h-full overflow-y-auto">
                            <Sidebar />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

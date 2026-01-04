'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BookOpen, MessageSquare, Settings, LogOut, Trello, LayoutGrid, Users, QrCode, Megaphone, FlaskConical, GraduationCap, Library, ChevronLeft, ChevronRight, Clock, Building, Brain, Menu } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { useUserRole } from '@/hooks/useUserRole';
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navigation = [
  // Student Views
  { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard/student', roles: ['student'] },
  { icon: BookOpen, label: 'Assignments', href: '/dashboard/student/assignments', roles: ['student'] },
  { icon: GraduationCap, label: 'Transcript', href: '/dashboard/student/transcript', roles: ['student'] },
  { icon: Library, label: 'Academic Hub', href: '/dashboard/student/academic-hub', roles: ['student'] },
  { icon: MessageSquare, label: 'Forums', href: '/dashboard/student/forums', roles: ['student'] },
  { icon: Brain, label: 'AI Center', href: '/dashboard/student/ai-center', roles: ['student'] },
  { icon: QrCode, label: 'Attendance', href: '/dashboard/student/attendance', roles: ['student'] },
  { icon: FlaskConical, label: 'Lab Booking', href: '/dashboard/student/labs', roles: ['student'] },
  { icon: Users, label: 'Groups', href: '/dashboard/student/groups', roles: ['student'] },

  // Lecturer Views
  { icon: LayoutGrid, label: 'Overview', href: '/dashboard/lecturer', roles: ['lecturer'] },
  { icon: Users, label: 'Student Radar', href: '/dashboard/lecturer/radar', roles: ['lecturer'] },
  { icon: Calendar, label: 'Attendance', href: '/dashboard/lecturer/attendance', roles: ['lecturer'] },

  // Staff Views
  { icon: FlaskConical, label: 'Manage Labs', href: '/dashboard/staff/labs', roles: ['staff', 'lecturer'] },
  { icon: Building, label: 'Manage Classrooms', href: '/dashboard/staff/classrooms', roles: ['staff', 'lecturer'] },

  // Admin Views
  { icon: LayoutGrid, label: 'Admin Dashboard', href: '/admin', roles: ['admin'] },
  { icon: BookOpen, label: 'Resources', href: '/admin/resources', roles: ['admin'] },
  { icon: Calendar, label: 'Events', href: '/admin/events', roles: ['admin'] },
  { icon: Calendar, label: 'Master Schedule', href: '/admin/schedule', roles: ['admin'] },
  { icon: Users, label: 'Manage Users', href: '/admin/users', roles: ['admin'] },
  { icon: FlaskConical, label: 'Health Status', href: '/admin/health', roles: ['admin'] },
  { icon: Clock, label: 'Teaching Cockpit', href: '/dashboard/staff', roles: ['lecturer', 'staff'] },
  { icon: QrCode, label: 'Smart Attendance', href: '/dashboard/staff/attendance', roles: ['lecturer', 'staff'] },
  { icon: BookOpen, label: 'Grading Stack', href: '/dashboard/staff/grading', roles: ['lecturer', 'staff'] },

  { icon: Settings, label: 'Settings', href: '/settings', roles: ['student', 'lecturer', 'staff', 'admin'] },
];

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { role, loading } = useUserRole();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (loading) {
    return (
      <div className={cn("flex h-full flex-col bg-black text-white border-r border-gray-800 transition-all duration-300", isCollapsed ? "w-20" : "w-64", className)}>
        <div className="h-16 border-b border-gray-800" />
        <div className="flex-1 p-4 space-y-4 animate-pulse">
          <div className="h-8 bg-gray-800 rounded" />
          <div className="h-8 bg-gray-800 rounded" />
          <div className="h-8 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  const filteredNavigation = navigation.filter(item =>
    role && item.roles.includes(role)
  );

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 md:hidden absolute top-4 left-4 z-50 bg-black text-white rounded-md">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-black text-white border-r border-gray-800 w-64">
        <SheetHeader className="p-4 border-b border-gray-800">
          <SheetTitle className="text-xl font-bold tracking-wider text-left text-white">UBES</SheetTitle>
        </SheetHeader>
        <NavContent />
      </SheetContent>
    </Sheet>
  );

  const NavContent = () => (
    <>
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors mb-1",
                isActive ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-900 hover:text-white',
                isCollapsed && "justify-center px-0"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 h-5 w-5 transition-colors",
                  isActive ? 'text-black' : 'text-gray-400 group-hover:text-white',
                  !isCollapsed && "mr-3"
                )}
                aria-hidden="true"
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              "group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:text-white transition-colors",
              isCollapsed && "justify-center"
            )}
            title="Sign Out"
          >
            <LogOut
              className={cn(
                "h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-white",
                !isCollapsed && "mr-3"
              )}
              aria-hidden="true"
            />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      <MobileNav />
      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex h-full flex-col bg-black text-white border-r border-gray-800 transition-all duration-300", isCollapsed ? "w-20" : "w-64", className)}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
          {!isCollapsed && <h1 className="text-xl font-bold tracking-wider truncate">UBES</h1>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <NavContent />
      </div>
    </>
  );
}

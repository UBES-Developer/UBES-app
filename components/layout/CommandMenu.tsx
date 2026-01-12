'use client';

import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    User,
    Search,
    BookOpen,
    LayoutDashboard,
    Users,
    MessageSquare,
    FileText
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <Button
                variant="outline"
                className="relative h-9 w-9 p-0 md:h-10 md:w-60 md:justify-start md:px-3 md:py-2 text-muted-foreground bg-slate-50/50 hover:bg-slate-100 border-slate-200"
                onClick={() => setOpen(true)}
            >
                <Search className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/student'))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/student/academic-hub'))}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>Academic Hub</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/student/groups'))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>My Groups</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Tools">
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/student/forums'))}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            <span>Forums</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/student/transcript'))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Transcript</span>
                        </CommandItem>
                         <CommandItem onSelect={() => runCommand(() => router.push('/events'))}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Campus Events</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}

'use client';

import { useState } from "react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, Copy, Shield, Trash, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { suspendUser, activateUser, deleteUser, updateUserRole } from "@/app/actions/admin";

interface UserProfile {
    id: string;
    username: string;
    full_name: string;
    role: string;
    status: string; // 'active', 'suspended', 'pending'
    created_at: string;
}

interface UserManagementProps {
    users: UserProfile[];
}

export function UserManagement({ users: initialUsers }: UserManagementProps) {
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const [filterRole, setFilterRole] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === "all" || user.role === filterRole;
        const matchesSearch = 
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
    });

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const toggleSelectUser = (id: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUsers(newSelected);
    };

    // Actions
    const handleSuspend = async (id: string) => {
        const promise = suspendUser(id);
        toast.promise(promise, {
            loading: 'Suspending user...',
            success: () => {
                setUsers(users.map(u => u.id === id ? { ...u, status: 'suspended' } : u));
                return 'User suspended';
            },
            error: 'Failed to suspend user'
        });
    };

    const handleActivate = async (id: string) => {
        const promise = activateUser(id);
        toast.promise(promise, {
            loading: 'Activating user...',
            success: () => {
                setUsers(users.map(u => u.id === id ? { ...u, status: 'active' } : u));
                return 'User activated';
            },
            error: 'Failed to activate user'
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete the user profile.")) return;
        
        const promise = deleteUser(id);
        toast.promise(promise, {
            loading: 'Deleting user...',
            success: () => {
                setUsers(users.filter(u => u.id !== id));
                return 'User deleted';
            },
            error: 'Failed to delete user'
        });
    };

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("ID copied to clipboard");
    };

    return (
        <div className="space-y-4">
            {/* Header: Tabs & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Tabs defaultValue="all" onValueChange={setFilterRole} className="w-full sm:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All Users</TabsTrigger>
                        <TabsTrigger value="student">Students</TabsTrigger>
                        <TabsTrigger value="lecturer">Lecturers</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                        <TabsTrigger value="admin">Admins</TabsTrigger>
                    </TabsList>
                </Tabs>
                
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search users..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Bulk Actions Toolbar (Conditional) */}
            {selectedUsers.size > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-md flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-indigo-900 ml-2">
                        {selectedUsers.size} selected
                    </span>
                    <div className="h-4 w-px bg-indigo-200" />
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            if(confirm(`Delete ${selectedUsers.size} users?`)) {
                                Array.from(selectedUsers).forEach(id => handleDelete(id));
                                setSelectedUsers(new Set());
                            }
                        }}
                    >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Selected
                    </Button>
                    {/* Add more bulk actions here later */}
                </div>
            )}

            {/* Main Table */}
            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-12">
                                <Checkbox 
                                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[300px]">User Details</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="group">
                                <TableCell>
                                    <Checkbox 
                                        checked={selectedUsers.has(user.id)}
                                        onChange={() => toggleSelectUser(user.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-3">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarImage src={`https://avatar.vercel.sh/${user.username}`} />
                                            <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-slate-900">{user.full_name || user.username || 'Unknown User'}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1.5 group-hover:text-indigo-500 transition-colors cursor-pointer" onClick={() => copyId(user.id)} title="Click to copy ID">
                                                {user.id.slice(0, 8)}...
                                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="outline" 
                                        className={cnBadge(user.role)}
                                    >
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${user.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <span className="text-sm capitalize text-slate-600">{user.status || 'active'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => copyId(user.id)}>
                                                Copy ID
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                            {user.status === 'suspended' ? (
                                                <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                    Activate User
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                                                    <Ban className="mr-2 h-4 w-4 text-orange-500" />
                                                    Suspend User
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600">
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No users found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function cnBadge(role: string) {
    switch (role) {
        case 'admin': return 'border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200';
        case 'lecturer': return 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200'; // Staff/Lecturer often same color
        case 'staff': return 'border-transparent bg-purple-100 text-purple-700 hover:bg-purple-200';
        default: return 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
}

'use client';

import { useState, useEffect } from "react";
import { getForumThreads, createThread } from "@/app/actions/academic";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Plus, Users, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function ForumsPage() {
    const [threads, setThreads] = useState<any[]>([]);
    const [category, setCategory] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', category: 'General', content: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadThreads();
    }, [category]);

    async function loadThreads() {
        setLoading(true);
        const cat = category === 'all' ? undefined : (category || undefined);
        const { data } = await getForumThreads(cat);
        if (data) setThreads(data);
        setLoading(false);
    }

    async function handleCreateThread() {
        if (!newThread.title || !newThread.content) return;

        const result = await createThread(newThread.title, newThread.category, newThread.content);
        if (result.success) {
            setDialogOpen(false);
            setNewThread({ title: '', category: 'General', content: '' });
            loadThreads();
        }
    }

    const categories = ['General', 'Course Help', 'Projects', 'Study Groups', 'Events'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Discussion Forums
                        </h1>
                        <p className="text-gray-600 mt-2">Connect with peers, ask questions, and share knowledge</p>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                New Thread
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle>Create New Thread</DialogTitle>
                                <DialogDescription>Start a discussion with your peers</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={newThread.title}
                                        onChange={e => setNewThread({ ...newThread, title: e.target.value })}
                                        placeholder="e.g., Need help with Physics Assignment"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={newThread.category} onValueChange={(v) => setNewThread({ ...newThread, category: v })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Message</Label>
                                    <Textarea
                                        value={newThread.content}
                                        onChange={e => setNewThread({ ...newThread, content: e.target.value })}
                                        placeholder="Share your thoughts or ask a question..."
                                        className="min-h-[120px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Attachment</Label>
                                    <Input type="file" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateThread} className="bg-gradient-to-r from-pink-500 to-purple-500">
                                    Create Thread
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats */}
                <BentoGrid className="md:grid-cols-3">
                    <BentoCard variant="glass" hover={false} size="sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{threads.length}</div>
                                <div className="text-xs text-gray-600">Active Threads</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" hover={false} size="sm">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {new Set(threads.map(t => t.author_id)).size}
                                </div>
                                <div className="text-xs text-gray-600">Contributors</div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard variant="glass" hover={false} size="sm">
                        <div className="flex gap-2 flex-wrap">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-full bg-white/60">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </BentoCard>
                </BentoGrid>

                {/* Threads List */}
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <BentoCard key={thread.id} variant="glass" className="hover:scale-[1.01] cursor-pointer">
                            <Link href={`/dashboard/student/forums/${thread.id}`}>
                                <div className="flex gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={thread.author?.avatar_url} />
                                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                                            {thread.author?.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{thread.title}</h3>
                                                <p className="text-sm text-gray-600">
                                                    by {thread.author?.full_name} • {new Date(thread.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {thread.category}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="h-4 w-4" />
                                                {thread.posts?.[0]?.count || 0} replies
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {new Date(thread.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </BentoCard>
                    ))}

                    {threads.length === 0 && !loading && (
                        <div className="text-center py-12 text-gray-400">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No threads yet. Be the first to start a discussion!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

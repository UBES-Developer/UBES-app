"use client"

import { useState } from "react"
import { Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { postMessage } from "@/app/actions/group-workspace"
import { toast } from "sonner"

interface Post {
    id: string
    content: string
    created_at: string
    author: {
        full_name: string
        email: string
    }
}

interface GroupChatProps {
    groupId: string
    initialPosts: Post[]
    currentUserId: string
}

export function GroupChat({ groupId, initialPosts, currentUserId }: GroupChatProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        // Optimistic update
        const tempId = Math.random().toString()
        const tempPost = {
            id: tempId,
            content: newMessage,
            created_at: new Date().toISOString(),
            author: { full_name: "Me", email: "" }
        }
        setPosts([...posts, tempPost])
        const msg = newMessage
        setNewMessage("")
        setSending(true)

        const res = await postMessage(groupId, msg)
        setSending(false)
        if (res.error) {
            toast.error(res.error)
            setPosts(posts) // Revert
        } else {
            // In a real app with subscriptions, we'd wait for the real echo back. 
            // Here we rely on revalidatePath in the action, but client state might need a hard refresh or we just stick with optimistic.
        }
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="bg-indigo-50/50 p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Group Chat</h3>
                <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Online
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {posts.length === 0 && (
                    <div className="text-center text-gray-400 text-sm py-10">No messages yet. Start the conversation!</div>
                )}
                {posts.map((post) => {
                    const isMe = post.author.full_name === "Me" || post.author.email === currentUserId; // simplified check
                    return (
                        <div key={post.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                    <User className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                                        {post.content}
                                    </div>
                                    <div className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {post.author.full_name !== "Me" ? post.author.full_name : "You"} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending} className="bg-indigo-600 hover:bg-indigo-700">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    )
}

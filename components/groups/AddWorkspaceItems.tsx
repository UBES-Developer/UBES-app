"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileUp } from "lucide-react"
import { toast } from "sonner"
import { addTask, addResource } from "@/app/actions/group-workspace"

export function AddTaskDialog({ groupId }: { groupId: string }) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await addTask(groupId, title, desc)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Task added to board")
            setOpen(false)
            setTitle("")
            setDesc("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Task</DialogTitle>
                    <DialogDescription>Add a card to the Kanban board.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Design Chassis" />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Card"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function AddResourceDialog({ groupId }: { groupId: string }) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [url, setUrl] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await addResource(groupId, title, url, "General")
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Resource shared")
            setOpen(false)
            setTitle("")
            setUrl("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <FileUp className="h-4 w-4 mr-2" /> Share File
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Resource</DialogTitle>
                    <DialogDescription>Link a file or document for the team.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Project Specs PDF" />
                    </div>
                    <div className="space-y-2">
                        <Label>Link (URL)</Label>
                        <Input value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>{loading ? "Sharing..." : "Share"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

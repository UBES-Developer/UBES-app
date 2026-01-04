"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, ExternalLink } from "lucide-react"
import { getSignedUrl } from "@/app/actions/storage"

interface SubmissionViewerProps {
    filePath: string | null
    studentName: string
    fileName: string
}

export function SubmissionViewer({ filePath, studentName, fileName }: SubmissionViewerProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleOpen = async (open: boolean) => {
        if (open && filePath && !url) {
            setLoading(true)
            const signed = await getSignedUrl(filePath)
            setUrl(signed)
            setLoading(false)
        }
    }

    if (!filePath) return <span className="text-slate-400 italic text-xs">No file</span>

    return (
        <Dialog onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    View Submission
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center pr-8">
                        <span>{studentName}'s Submission</span>
                        {url && (
                            <Button variant="ghost" size="sm" asChild>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    Open in New Tab <ExternalLink className="h-4 w-4 ml-2" />
                                </a>
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex items-center justify-center relative">
                    {loading ? (
                        <div className="flex flex-col items-center gap-2 text-slate-500">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <p>Loading document...</p>
                        </div>
                    ) : url ? (
                        <iframe
                            src={url}
                            className="w-full h-full"
                            title="Submission Preview"
                        />
                    ) : (
                        <div className="text-red-500">Failed to load document preview.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

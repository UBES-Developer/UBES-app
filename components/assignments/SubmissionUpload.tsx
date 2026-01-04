"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    UploadCloud,
    FileText,
    History,
    Shield,
    X
} from "lucide-react"

interface SubmissionUploadProps {
    assignmentId: string
    allowDrafts: boolean
    submissionHistory: Array<{ id: number; name: string; time: string; ai_check: string }>
}

import { submitAssignmentAction } from "@/app/actions/submissions";
import { toast } from "sonner"; // Assuming sonner is installed or falling back to alert

export function SubmissionUpload({ assignmentId, allowDrafts, submissionHistory }: SubmissionUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [integrityChecked, setIntegrityChecked] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // ... (Handlers for drag overlap logic can stay) ...
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const onButtonClick = () => {
        inputRef.current?.click()
    }

    const removeFile = () => {
        setFile(null)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    const handleSubmit = async () => {
        if (!file || !integrityChecked) return
        setIsSubmitting(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("assignmentId", assignmentId)
        formData.append("integrityCheck", String(integrityChecked))

        try {
            const result = await submitAssignmentAction(formData)
            if (result.success) {
                alert("Success: " + result.message) // Replace with toast if available
                setFile(null)
                setIntegrityChecked(false)
            } else {
                alert("Error: " + result.message)
            }
        } catch (error) {
            alert("Unexpected error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            {/* Same JSX ... */}
            <CardHeader>
                <CardTitle>Agile Submission</CardTitle>
                <CardDescription>Upload drafts early for AI pre-checks. Finalize when ready.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* File Dropzone */}
                {!file ? (
                    <div
                        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition cursor-pointer ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:bg-slate-50"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={onButtonClick}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={handleChange}
                            accept=".pdf,.docx"
                        />
                        <div className="bg-indigo-50 p-3 rounded-full mb-3">
                            <UploadCloud className={`h-6 w-6 ${dragActive ? "text-indigo-700" : "text-indigo-600"}`} />
                        </div>
                        <h4 className="font-medium text-slate-900">
                            {dragActive ? "Drop file here" : "Drag & drop your PDF here"}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                    </div>
                ) : (
                    <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded border border-indigo-100">
                                <FileText className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <div className="font-medium text-slate-900 text-sm">{file.name}</div>
                                <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8 text-slate-400 hover:text-red-500">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Draft History */}
                {allowDrafts && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                            <History className="h-4 w-4" /> Attempt History
                        </div>
                        <div className="space-y-2">
                            {submissionHistory.map((sub) => (
                                <div key={sub.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                                    <span className="flex items-center text-slate-600">
                                        <FileText className="h-3 w-3 mr-2" /> {sub.name}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-400">{sub.time}</span>
                                        <Badge variant="secondary" className="text-[10px] h-5">{sub.ai_check}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Separator />

                {/* Integrity Pledge */}
                <div className="flex items-start gap-3 p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <Checkbox
                        id="integrity"
                        className="mt-1"
                        checked={integrityChecked}
                        onChange={(e) => setIntegrityChecked(e.target.checked)}
                    />
                    <div className="space-y-1">
                        <Label htmlFor="integrity" className="font-medium cursor-pointer">Academic Integrity Pledge</Label>
                        <p className="text-sm text-slate-500 leading-snug">
                            I certify that this submission is my own work. I have not used unauthorized AI generation without citation, and I understand the university's plagiarism policy.
                        </p>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="bg-slate-50 border-t flex justify-end gap-3 p-4">
                <Button variant="ghost" disabled={!file || isSubmitting}>Save Draft</Button>
                <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={!file || !integrityChecked || isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? "Uploading..." : "Submit Final"}
                    {!isSubmitting && <Shield className="h-4 w-4 ml-2" />}
                </Button>
            </CardFooter>
        </Card>
    )
}

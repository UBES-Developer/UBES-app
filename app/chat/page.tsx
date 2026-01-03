'use client';

import { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Paperclip, MoreVertical, Briefcase, GraduationCap } from 'lucide-react';
import { useChat } from 'ai/react';

export default function Chat() {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
        api: '/api/chat',
        body: {
            mode: isAdminMode ? 'admin' : 'tutor'
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Upload to Next.js backend
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.detail || 'Failed to upload PDF');
                return;
            }

            const result = await response.json();

            if (result.text) {
                // Truncate text if it's too long (OpenAI limits) - simplistic check
                const maxLength = 20000;
                const textToProcess = result.text.length > maxLength
                    ? result.text.substring(0, maxLength) + '...[truncated]'
                    : result.text;

                await append({
                    role: 'user',
                    content: `Here is the content of the PDF "${file.name}":\n\n${textToProcess}\n\nPlease summarize this document.`
                });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload and parse the PDF.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* Chat Header */}
            <div className={`px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 transition-colors ${isAdminMode ? 'bg-slate-100' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isAdminMode ? 'bg-slate-800' : 'bg-black'}`}>
                        {isAdminMode ? (
                            <Briefcase className="h-6 w-6 text-white" />
                        ) : (
                            <GraduationCap className="h-6 w-6 text-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            {isAdminMode ? 'Administrative Assistant' : 'Academic Tutor'}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {isAdminMode ? 'Help with policies & deadlines' : 'Help with coursework & concepts'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setIsAdminMode(!isAdminMode)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${isAdminMode
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        {isAdminMode ? 'Switch to Tutor' : 'Switch to Admin'}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="flex flex-col justify-center items-center h-full text-gray-400 text-sm space-y-2">
                        {isAdminMode ? (
                            <>
                                <Briefcase className="h-12 w-12 opacity-20" />
                                <p>Ask about deadlines, registration, or campus policies.</p>
                            </>
                        ) : (
                            <>
                                <GraduationCap className="h-12 w-12 opacity-20" />
                                <p>Ask about math, physics, or engineering concepts.</p>
                            </>
                        )}
                    </div>
                )}
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                } space-x-3`}
                        >
                            <div
                                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${message.role === 'user'
                                    ? 'bg-gray-200'
                                    : (isAdminMode ? 'bg-slate-800' : 'bg-black')
                                    }`}
                            >
                                {message.role === 'user' ? (
                                    <User className="h-5 w-5 text-gray-600" />
                                ) : (
                                    <Bot className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <div
                                className={`rounded-2xl px-4 py-2 text-sm ${message.role === 'user'
                                    ? 'bg-black text-white rounded-tr-none'
                                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                {message.createdAt && (
                                    <p
                                        suppressHydrationWarning
                                        className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-gray-400' : 'text-gray-500'
                                            }`}
                                    >
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isAdminMode ? 'bg-slate-800' : 'bg-black'}`}>
                                <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <form onSubmit={handleSubmit} className="flex items-end space-x-2 bg-gray-50 rounded-lg border border-gray-200 p-2 focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf"
                        onChange={handleFileSelect}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || isLoading}
                        className={`p-2 transition-colors ${isUploading ? 'text-black animate-pulse' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={isAdminMode ? "Ask about admin policies..." : "Ask a question about your homework..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2 text-sm text-gray-900 placeholder-gray-500"
                        rows={1}
                        style={{ minHeight: '40px' }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isUploading}
                        className={`p-2 rounded-md transition-colors ${input.trim() && !isLoading
                            ? (isAdminMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-black text-white hover:bg-gray-800')
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-2">
                    AI can make mistakes. Please verify important information.
                </p>
            </div>
        </div>
    );
}

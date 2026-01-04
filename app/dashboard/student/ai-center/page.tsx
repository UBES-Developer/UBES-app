"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Brain, Palette, Code, PenTool, Layout, Sparkles, MessageSquare, Image, Terminal, FileText, Zap, Bot } from "lucide-react";
import Link from "next/link";

const aiTools = [
    {
        category: "General Intelligence & Conversational AI",
        icon: MessageSquare,
        description: "General-purpose AI for chat, content creation, and reasoning.",
        tools: [
            { name: "ChatGPT (OpenAI)", url: "https://chat.openai.com", desc: "General-purpose AI for chat, content creation, and reasoning." },
            { name: "Claude (Anthropic)", url: "https://claude.ai", desc: "Known for reasoning and large context window processing." },
            { name: "Gemini (Google)", url: "https://gemini.google.com", desc: "Integrated with Google Workspace for search and productivity." },
        ]
    },
    {
        category: "Visual Creativity & Design",
        icon: Palette,
        description: "Artistic AI models for image and video generation.",
        tools: [
            { name: "Midjourney", url: "https://www.midjourney.com", desc: "Artistic AI model for image and video generation." },
            { name: "DALL·E 3 (OpenAI)", url: "https://openai.com/dall-e-3", desc: "Specializes in following complex textual instructions for images." },
        ]
    },
    {
        category: "Software Engineering & Technical Work",
        icon: Terminal,
        description: "AI for code completion and technical pair programming.",
        tools: [
            { name: "GitHub Copilot", url: "https://github.com/features/copilot", desc: "Real-time code completion and technical pair programming." },
            { name: "Tabnine", url: "https://www.tabnine.com", desc: "AI code assistant designed for enterprise-level software engineering." },
        ]
    },
    {
        category: "Content Marketing & Writing",
        icon: PenTool,
        description: "Platforms for creating marketing copy and content workflows.",
        tools: [
            { name: "Jasper", url: "https://www.jasper.ai", desc: "Platform for creating marketing copy." },
            { name: "Copy.ai", url: "https://www.copy.ai", desc: "Automates sales and marketing content workflows." },
        ]
    },
    {
        category: "Workspace Productivity & Emerging Agents",
        icon: Zap,
        description: "Tools for summarization, writing, and complex task automation.",
        tools: [
            { name: "Notion AI", url: "https://www.notion.so/product/ai", desc: "Productivity tools for summarization, writing, and database management." },
            { name: "Devin (Cognition AI)", url: "https://www.cognition-labs.com", desc: "AI software engineer capable of complex coding tasks." },
            { name: "Lindy", url: "https://www.lindy.ai", desc: "AI assistant focused on complex task automation." },
        ]
    }
];

export default function AICenterPage() {
    return (
        <div className="container mx-auto p-8 max-w-7xl space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Brain className="h-8 w-8 text-indigo-600" />
                    AI Center
                </h1>
                <p className="text-slate-500 text-lg">Curated intelligence tools to supercharge your workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiTools.map((category, idx) => (
                    <Card key={idx} className="flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <category.icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <Badge variant="outline" className="text-slate-500 font-normal">
                                    {category.tools.length} Tools
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-semibold text-slate-900">
                                {category.category}
                            </CardTitle>
                            {/* <CardDescription>{category.description}</CardDescription> */}
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            {category.tools.map((tool, tIdx) => (
                                <div key={tIdx} className="group relative bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-slate-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                                                {tool.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 leading-snug">
                                                {tool.desc}
                                            </p>
                                        </div>
                                        <a
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="h-3 w-3 text-indigo-500" />
                                        </a>
                                    </div>
                                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`Open ${tool.name}`} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white flex flex-col items-center text-center space-y-4 shadow-lg">
                <Sparkles className="h-10 w-10 text-yellow-300" />
                <h2 className="text-2xl font-bold">Suggestions?</h2>
                <p className="max-w-xl text-indigo-100">
                    The AI landscape is moving fast. If you discover a new tool that benefits your studies, let us know so we can add it to the center.
                </p>
                <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                    Suggest a Tool
                </Button>
            </div>
        </div>
    );
}

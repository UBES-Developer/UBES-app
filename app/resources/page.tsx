'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Video, Code, Download, Loader2 } from 'lucide-react';
import { getResources } from '@/app/actions/resources';
import { Database } from '@/types/supabase';

type Resource = Database['public']['Tables']['resources']['Row'];

const categories = ['All', 'Tutorial', 'Cheat Sheet', 'Video', 'Code', 'Past Paper'];

export default function Resources() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getResources(searchTerm, selectedCategory);
                setResources(data);
            } catch (error) {
                console.error('Failed to fetch resources:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchTerm, selectedCategory]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'Video': return Video;
            case 'Code': return Code;
            default: return FileText;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resource Center</h1>
                    <p className="text-gray-500 mt-1">Access study materials, tutorials, and past papers.</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                    Upload Resource
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Search by title or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
                    <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resource Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => {
                        const Icon = getIcon(resource.type);
                        return (
                            <div key={resource.id} className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Icon className="h-6 w-6 text-gray-700" />
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {resource.type}
                                    </span>
                                </div>
                                <div className="mt-4 flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{resource.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{resource.course}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="text-xs text-gray-500">
                                        {new Date(resource.created_at).toLocaleDateString()}
                                    </div>
                                    <button className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors">
                                        <Download className="h-4 w-4 mr-1" />
                                        {resource.downloads}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

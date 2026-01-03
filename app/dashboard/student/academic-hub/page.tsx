'use client';

import { useState, useEffect } from "react";
import { getAcademicResources } from "@/app/actions/academic";
import { getAvailableCourses, enrollInCourse, getStudentSchedule } from "@/app/actions/courses";
import { BentoCard, BentoGrid } from "@/components/bento/BentoCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen, Download, FileText, Calendar, Book,
    Search, Plus, Check, MapPin, Clock
} from "lucide-react";
import { toast } from "sonner";

export default function AcademicHubPage() {
    const [activeTab, setActiveTab] = useState('resources');

    // Resources State
    const [resources, setResources] = useState<any[]>([]);
    const [filter, setFilter] = useState({ type: '', module: '' });

    // Courses State
    const [courses, setCourses] = useState<any[]>([]);
    const [enrolling, setEnrolling] = useState<string | null>(null);

    // Schedule State
    const [schedule, setSchedule] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        loadData();
    }, [activeTab, filter]); // Reload when tab changes or filter changes (for resources)

    async function loadData() {
        setLoading(true);
        try {
            if (activeTab === 'resources') {
                const filterToUse = {
                    ...filter,
                    type: filter.type === 'all' ? '' : filter.type
                };
                const { data } = await getAcademicResources((filterToUse.type || filterToUse.module) ? filterToUse : undefined);
                if (data) setResources(data);
            }
            else if (activeTab === 'registration') {
                const { data } = await getAvailableCourses();
                if (data) setCourses(data);
            }
            else if (activeTab === 'timetable') {
                const { data } = await getStudentSchedule();
                if (data) setSchedule(data);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function handleEnroll(courseId: string) {
        setEnrolling(courseId);
        const res = await enrollInCourse(courseId);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Enrolled successfully!");
            // Refresh courses to update UI (if we were tracking enrolled state there)
            loadData();
        }
        setEnrolling(null);
    }

    // Helper for Resources
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'syllabus': return <FileText className="h-5 w-5" />;
            case 'ebook': return <Book className="h-5 w-5" />;
            case 'schedule': return <Calendar className="h-5 w-5" />;
            case 'lecture_note': return <BookOpen className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'syllabus': return 'bg-blue-500/20';
            case 'ebook': return 'bg-purple-500/20';
            case 'schedule': return 'bg-green-500/20';
            case 'lecture_note': return 'bg-orange-500/20';
            default: return 'bg-gray-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header & Library Search */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Academic Hub
                        </h1>
                        <p className="text-gray-600 mt-2">Your central command for academic success</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-2 rounded-xl border border-white/40 shadow-sm w-full md:w-auto">
                        <Search className="h-4 w-4 text-gray-500 ml-2" />
                        <Input
                            placeholder="Search Library Database..."
                            className="bg-transparent border-none shadow-none focus-visible:ring-0 w-full md:w-64"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    window.open(`https://scholar.google.com/scholar?q=${(e.target as HTMLInputElement).value}`, '_blank');
                                }
                            }}
                        />
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 md:w-[400px] mb-8 bg-white/50 backdrop-blur-sm">
                        <TabsTrigger value="resources">Resources</TabsTrigger>
                        <TabsTrigger value="registration">Registration</TabsTrigger>
                        <TabsTrigger value="timetable">Timetable</TabsTrigger>
                    </TabsList>

                    {/* TAB 1: RESOURCES */}
                    <TabsContent value="resources" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Quick Stats (Only show on resources tab) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {['syllabus', 'ebook', 'schedule', 'lecture_note'].map(type => (
                                <div key={type} className="bg-white/40 backdrop-blur-sm border border-white/40 p-4 rounded-xl flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
                                        {getTypeIcon(type)}
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-gray-900">
                                            {resources.filter(r => r.resource_type === type).length}
                                        </div>
                                        <div className="text-xs text-gray-600 capitalize">{type.replace('_', ' ')}s</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Learning Materials</h2>
                            <Select value={filter.type} onValueChange={(v) => setFilter({ ...filter, type: v })}>
                                <SelectTrigger className="w-40 bg-white/60">
                                    <SelectValue placeholder="Filter Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="syllabus">Syllabi</SelectItem>
                                    <SelectItem value="ebook">E-books</SelectItem>
                                    <SelectItem value="schedule">Schedules</SelectItem>
                                    <SelectItem value="lecture_note">Lecture Notes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <BentoGrid className="md:grid-cols-3 lg:grid-cols-4">
                            {resources.map((resource) => (
                                <BentoCard key={resource.id} variant="glass" className="hover:scale-[1.02] transition-transform">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-3 rounded-2xl ${getTypeColor(resource.resource_type)}`}>
                                                {getTypeIcon(resource.resource_type)}
                                            </div>
                                            <Badge variant="outline" className="text-xs capitalize">{resource.resource_type.replace('_', ' ')}</Badge>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{resource.title}</h3>
                                            <p className="text-xs text-gray-600 line-clamp-2">{resource.description || 'No description'}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Badge variant="secondary" className="bg-slate-100">{resource.module || 'General'}</Badge>
                                        </div>
                                        <Button className="w-full h-8 text-xs" variant="outline" onClick={() => window.open(resource.file_url, '_blank')}>
                                            <Download className="h-3 w-3 mr-2" /> Download
                                        </Button>
                                    </div>
                                </BentoCard>
                            ))}
                            {resources.length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-gray-400">No resources found.</div>
                            )}
                        </BentoGrid>
                    </TabsContent>

                    {/* TAB 2: REGISTRATION */}
                    <TabsContent value="registration" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-6">
                            <h2 className="text-2xl font-bold mb-2">Semester 2 Registration</h2>
                            <p className="text-indigo-100 max-w-2xl">Browse available modules for the upcoming semester. Ensure you meet the prerequisites before enrolling.</p>
                        </div>

                        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md p-2 rounded-xl border border-white/40 shadow-sm max-w-md">
                            <Search className="h-4 w-4 text-gray-500 ml-2" />
                            <Input
                                placeholder="Search Courses..."
                                className="bg-transparent border-none shadow-none focus-visible:ring-0"
                                value={filter.module} // Reusing module filter state for search
                                onChange={(e) => setFilter({ ...filter, module: e.target.value })}
                            />
                        </div>

                        <BentoGrid className="md:grid-cols-3">
                            {courses.filter(c =>
                                !filter.module ||
                                c.name.toLowerCase().includes(filter.module.toLowerCase()) ||
                                c.code.toLowerCase().includes(filter.module.toLowerCase())
                            ).map(course => (
                                <BentoCard key={course.id} variant="glass" className="border-l-4 border-l-indigo-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{course.code}</h3>
                                            <p className="text-sm font-medium text-indigo-600">{course.faculty}</p>
                                        </div>
                                        <Badge variant="secondary">{course.credits} Credits</Badge>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-2">{course.name}</h4>
                                    <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{course.description}</p>

                                    <div className="flex justify-between items-center mt-auto">
                                        <div className="text-xs text-gray-500">
                                            {course.semester}
                                        </div>
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={enrolling === course.id}
                                        >
                                            {enrolling === course.id ? 'Enrolling...' : <><Plus className="h-4 w-4 mr-1" /> Enroll</>}
                                        </Button>
                                    </div>
                                </BentoCard>
                            ))}
                            {courses.filter(c => !filter.module || c.name.toLowerCase().includes(filter.module.toLowerCase()) || c.code.toLowerCase().includes(filter.module.toLowerCase())).length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-gray-400">No courses match your search.</div>
                            )}
                        </BentoGrid>
                    </TabsContent>

                    {/* TAB 3: TIMETABLE */}
                    <TabsContent value="timetable" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid md:grid-cols-5 gap-4">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                                const daySessions = schedule.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
                                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

                                return (
                                    <div key={day} className={`rounded-xl p-4 border ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white/60 border-white/40'}`}>
                                        <h3 className={`font-bold mb-4 ${isToday ? 'text-indigo-700' : 'text-gray-700'}`}>{day}</h3>

                                        <div className="space-y-3">
                                            {daySessions.map(session => (
                                                <div key={session.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-gray-900">{session.courses?.code}</span>
                                                        <Badge variant="outline" className="text-[10px] h-5">{session.session_type}</Badge>
                                                    </div>
                                                    <div className="text-xs text-gray-600 line-clamp-1 mb-2">{session.courses?.name}</div>

                                                    <div className="space-y-1 text-xs text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {session.location}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {daySessions.length === 0 && (
                                                <div className="text-center py-4 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                                                    Free
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

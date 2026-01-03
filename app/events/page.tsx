'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { getEvents } from '@/app/actions/events';
import { Database } from '@/types/supabase';

type Event = Database['public']['Tables']['events']['Row'];

export default function Events() {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">School Events</h1>
                    <p className="text-gray-500 mt-1">Stay updated with workshops, lectures, and social events.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'calendar' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Calendar
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : view === 'list' ? (
                <div className="space-y-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:border-black transition-colors group">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 bg-gray-50 rounded-lg p-3 text-center min-w-[80px] border border-gray-100">
                                    <span className="block text-xs font-medium text-gray-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                    <span className="block text-2xl font-bold text-gray-900">{new Date(event.date).getDate()}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-black">{event.title}</h3>
                                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1.5" />
                                            {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-1.5" />
                                            {event.location}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {event.category}
                                        </span>
                                        <span className="flex items-center text-xs text-gray-500">
                                            <Users className="h-3 w-3 mr-1" />
                                            {event.attendees_count} attending
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-0">
                                <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                                    RSVP
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Calendar View</h3>
                    <p className="mt-1 text-sm text-gray-500">Calendar integration coming soon.</p>
                </div>
            )}
        </div>
    );
}

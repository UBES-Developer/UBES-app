'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Database } from '@/types/supabase';

type Resource = Database['public']['Tables']['resources']['Row'];

const MOCK_RESOURCES: Resource[] = [
    { id: 1, created_at: new Date().toISOString(), title: 'Calculus II: Integration Techniques', course: 'MATH 201', type: 'Tutorial', url: '#', uploader_id: 'mock', downloads: 120, description: null },
    { id: 2, created_at: new Date().toISOString(), title: 'Thermodynamics Laws Summary', course: 'MECH 205', type: 'Cheat Sheet', url: '#', uploader_id: 'mock', downloads: 85, description: null },
    { id: 3, created_at: new Date().toISOString(), title: 'Circuit Analysis: Node Voltage Method', course: 'ELEC 202', type: 'Video', url: '#', uploader_id: 'mock', downloads: 200, description: null },
    { id: 4, created_at: new Date().toISOString(), title: 'Python Data Structures', course: 'CS 101', type: 'Code', url: '#', uploader_id: 'mock', downloads: 340, description: null },
    { id: 5, created_at: new Date().toISOString(), title: 'Physics I: Mechanics Past Paper 2022', course: 'PHYS 101', type: 'Past Paper', url: '#', uploader_id: 'mock', downloads: 500, description: null },
    { id: 6, created_at: new Date().toISOString(), title: 'Linear Algebra: Eigenvalues', course: 'MATH 202', type: 'Tutorial', url: '#', uploader_id: 'mock', downloads: 95, description: null },
];

export async function getResources(query?: string, category?: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        let request = supabase.from('resources').select('*');

        if (query) {
            request = request.or(`title.ilike.%${query}%,course.ilike.%${query}%`);
        }

        if (category && category !== 'All') {
            request = request.eq('type', category);
        }

        const { data, error } = await request;

        if (error || !data) {
            console.warn('Supabase error or no data, falling back to mock data:', error);
            throw new Error('Fallback to mock');
        }

        return data as Resource[];
    } catch (e) {
        // Fallback to mock data filtering
        let filtered = [...MOCK_RESOURCES];
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(r =>
                r.title.toLowerCase().includes(lowerQuery) ||
                (r.course && r.course.toLowerCase().includes(lowerQuery))
            );
        }
        if (category && category !== 'All') {
            filtered = filtered.filter(r => r.type === category);
        }
        return filtered;
    }
}

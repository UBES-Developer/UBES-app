export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    website: string | null
                    role: 'student' | 'admin'
                    student_id: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    role?: 'student' | 'admin'
                    student_id?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    website?: string | null
                    role?: 'student' | 'admin'
                    student_id?: string | null
                }
            }
            resources: {
                Row: {
                    id: number
                    created_at: string
                    title: string
                    description: string | null
                    type: string
                    course: string | null
                    url: string
                    uploader_id: string
                    downloads: number
                }
                Insert: {
                    id?: number
                    created_at?: string
                    title: string
                    description?: string | null
                    type: string
                    course?: string | null
                    url: string
                    uploader_id: string
                    downloads?: number
                }
                Update: {
                    id?: number
                    created_at?: string
                    title?: string
                    description?: string | null
                    type?: string
                    course?: string | null
                    url?: string
                    uploader_id?: string
                    downloads?: number
                }
            }
            events: {
                Row: {
                    id: number
                    created_at: string
                    title: string
                    description: string | null
                    date: string
                    location: string | null
                    category: string | null
                    attendees_count: number
                }
                Insert: {
                    id?: number
                    created_at?: string
                    title: string
                    description?: string | null
                    date: string
                    location?: string | null
                    category?: string | null
                    attendees_count?: number
                }
                Update: {
                    id?: number
                    created_at?: string
                    title?: string
                    description?: string | null
                    date?: string
                    location?: string | null
                    category?: string | null
                    attendees_count?: number
                }
            }
        }
    }
}

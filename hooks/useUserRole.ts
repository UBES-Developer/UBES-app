'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserRole() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        async function fetchRole() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Try to get role from metadata first (faster)
                    if (user.user_metadata?.role) {
                        setRole(user.user_metadata.role);
                    } else {
                        // Fallback to profile fetch
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', user.id)
                            .single();

                        if (profile) {
                            setRole(profile.role);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching role:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchRole();
    }, []);

    return { role, loading };
}

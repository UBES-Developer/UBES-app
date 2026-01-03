import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isValidUrl = envUrl && envUrl.startsWith('http');
    const supabaseUrl = isValidUrl ? envUrl! : 'https://example.com';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'mock-key';

    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    )
}

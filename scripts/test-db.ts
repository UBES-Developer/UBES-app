
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    // Try to fetch a public table or just check health (since profiles might be RLS protected)
    // We'll try to select count from resources which typically allows public read
    const { count, error } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Connection failed:', error.message);
        // It might be RLS, but if we get a response it means we connected.
        // "Relation does not exist" means DB is empty/unmigrated.
        // "Network request failed" means URL is wrong.
    } else {
        console.log('Connection successful!');
        console.log(`Resources count: ${count}`);
    }
}

testConnection();

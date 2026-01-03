import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function TestDBPage() {
    // We use our existing helper which handles cookies automatically
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Query 'profiles' instead of 'todos' since 'todos' doesn't exist in our schema
    // and 'profiles' is a public table we set up.
    const { data: profiles, error } = await supabase.from('profiles').select('*').limit(5);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    <p className="font-bold">Error connecting:</p>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {profiles && (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 text-green-700 rounded border border-green-200">
                        <p className="font-bold">Success! Connected to database.</p>
                        <p>{profiles.length} profiles found.</p>
                    </div>
                    <ul className="list-disc pl-5">
                        {profiles.map((profile) => (
                            <li key={profile.id}>{profile.full_name || 'Unnamed User'} ({profile.role})</li>
                        ))}
                    </ul>
                </div>
            )}

            {(!profiles || profiles.length === 0) && !error && (
                <p className="text-gray-500">Connected, but no profiles found. (Did you run the setup SQL?)</p>
            )}
        </div>
    );
}

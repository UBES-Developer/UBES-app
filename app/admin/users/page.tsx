import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { UserManagement } from "@/components/admin/users/UserManagement";

export default async function UsersPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="text-red-500">Error loading users: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <p className="text-slate-500 mt-2">Manage access, roles, and user status.</p>
            </div>

            <UserManagement users={users || []} />
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full bg-slate-50 p-6">
            {children}
        </div>
    );
}

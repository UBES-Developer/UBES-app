import { getActiveBroadcastsForUser } from "@/app/actions/staff";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, AlertCircle, Info } from "lucide-react";

export default async function BroadcastBanner() {
    const { data: broadcasts } = await getActiveBroadcastsForUser();

    if (!broadcasts || broadcasts.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {broadcasts.map((b: any) => (
                <Alert
                    key={b.id}
                    className={`${b.priority === 'urgent' ? 'border-red-500 bg-red-50 text-red-900' :
                            b.priority === 'high' ? 'border-orange-500 bg-orange-50 text-orange-900' :
                                'border-blue-500 bg-blue-50 text-blue-900'
                        }`}
                >
                    <div className="flex items-start">
                        {b.priority === 'urgent' ? <AlertCircle className="h-5 w-5 mr-2" /> : <Megaphone className="h-5 w-5 mr-2" />}
                        <div className="flex-1">
                            <AlertTitle className="font-bold mb-1 flex justify-between">
                                {b.title}
                                <span className="text-xs font-normal opacity-75 uppercase tracking-wider border px-1 rounded">
                                    {b.priority}
                                </span>
                            </AlertTitle>
                            <AlertDescription className="text-sm opacity-90">
                                {b.message}
                            </AlertDescription>
                            <div className="text-[10px] mt-2 opacity-60 text-right">
                                {new Date(b.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </Alert>
            ))}
        </div>
    );
}

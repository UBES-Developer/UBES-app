import { getKanbanData } from "@/app/actions/kanban";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { BentoCard } from "@/components/bento/BentoCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Trello } from "lucide-react";

export default async function DesignPage() {
    const { board, columns, tasks, error } = await getKanbanData();

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6 flex items-center justify-center">
                <BentoCard variant="glass" className="max-w-md">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-red-600">Error Loading Board</h2>
                        <p className="text-gray-600 mt-2">{error}</p>
                    </div>
                </BentoCard>
            </div>
        );
    }

    if (!board) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6 flex items-center justify-center">
                <div className="text-gray-600">Loading Project Hub...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
            <div className="space-y-6">
                {/* Header Card */}
                <BentoCard variant="glass" className="backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <Trello className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
                                <p className="text-sm text-gray-600">Collaborative Project Hub for Group Projects</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-gray-500" />
                            <div className="flex -space-x-2">
                                <Avatar className="h-8 w-8 border-2 border-white">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-400 text-white text-xs">JD</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8 border-2 border-white">
                                    <AvatarFallback className="bg-gradient-to-br from-pink-400 to-orange-400 text-white text-xs">AS</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8 border-2 border-white">
                                    <AvatarFallback className="bg-gray-200 text-gray-500 text-xs">+3</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                {/* Kanban Board */}
                <div className="rounded-3xl bg-white/60 backdrop-blur-md border border-white/20 shadow-lg p-6 overflow-x-auto">
                    <KanbanBoard
                        initialColumns={columns || []}
                        initialTasks={tasks || []}
                    />
                </div>
            </div>
        </div>
    );
}

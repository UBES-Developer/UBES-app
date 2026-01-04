import { Button } from "@/components/ui/button"
import { ExternalLink, LucideIcon } from "lucide-react"
import Link from "next/link"

export interface ResourceItem {
    name: string
    href: string
    description?: string
    icon?: LucideIcon
}

export function ResourceList({ items }: { items: ResourceItem[] }) {
    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all bg-white shadow-sm">
                    <div className="mb-2 sm:mb-0">
                        <div className="flex items-center font-medium text-slate-900 text-sm">
                            {item.icon && <item.icon className="h-4 w-4 mr-2 text-indigo-500" />}
                            {item.name}
                        </div>
                        {item.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                        )}
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs shrink-0">
                        <Link href={item.href} target="_blank" rel="noopener noreferrer">
                            Visit <ExternalLink className="h-3 w-3 ml-2" />
                        </Link>
                    </Button>
                </div>
            ))}
        </div>
    )
}

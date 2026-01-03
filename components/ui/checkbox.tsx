"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        // We use a real checkbox but hide it visually and overlay a styled div
        // OR we use a button role. Radix does button role.
        // For specific compatibility with FormData, using valid input type="checkbox" is best.
        return (
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className="peer h-4 w-4 opacity-0 absolute cursor-pointer"
                    ref={ref}
                    {...props}
                />
                <div className={cn(
                    "h-4 w-4 shrink-0 rounded-sm border border-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50 peer-checked:bg-slate-900 peer-checked:text-slate-50 flex items-center justify-center",
                    className
                )}>
                    <Check className="h-3 w-3 hidden peer-checked:block text-white" />
                </div>
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

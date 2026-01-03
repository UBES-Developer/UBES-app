import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'glass' | 'solid' | 'dark' | 'gradient';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
    onClick?: () => void;
}

export function BentoCard({
    children,
    className,
    variant = 'glass',
    size = 'md',
    hover = true,
    onClick
}: BentoCardProps) {
    const variants = {
        glass: "bg-white/60 backdrop-blur-md border border-white/20 shadow-lg",
        solid: "bg-white border border-gray-200 shadow-md",
        dark: "bg-gray-900 border border-gray-800 text-white shadow-xl",
        gradient: "bg-gradient-to-br from-blue-400/20 to-purple-400/20 backdrop-blur-md border border-white/30 shadow-lg"
    };

    const sizes = {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10"
    };

    return (
        <div
            className={cn(
                "rounded-3xl transition-all duration-300",
                variants[variant],
                sizes[size],
                hover && "hover:scale-[1.02] hover:shadow-2xl",
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

interface BentoGridProps {
    children: ReactNode;
    className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6",
            className
        )}>
            {children}
        </div>
    );
}

interface BentoStatProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
}

export function BentoStat({ label, value, icon, trend, color = "blue" }: BentoStatProps) {
    const colors: Record<string, string> = {
        blue: "from-blue-400 to-blue-600",
        green: "from-green-400 to-green-600",
        purple: "from-purple-400 to-purple-600",
        orange: "from-orange-400 to-orange-600",
        red: "from-red-400 to-red-600"
    };

    return (
        <div className="space-y-2">
            {icon && (
                <div className={cn(
                    "inline-flex p-3 rounded-2xl bg-gradient-to-br",
                    colors[color]
                )}>
                    {icon}
                </div>
            )}
            <div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-gray-900 to-gray-600">
                    {value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{label}</div>
            </div>
        </div>
    );
}

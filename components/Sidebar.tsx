"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ListFilter, Bookmark, Settings, Activity } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
    { name: "Companies", href: "/companies", icon: Users },
    { name: "Lists", href: "/lists", icon: ListFilter },
    { name: "Saved Searches", href: "/saved", icon: Bookmark },
    { name: "Signal Pulse", href: "/signal-pulse", icon: Activity },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-cardDark border-r border-borderDark flex flex-col h-screen sticky top-0 transition-colors duration-200">
            <div className="p-6 border-b border-borderDark flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                    <Activity className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-textPrimary">Precision AI</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href) && item.href !== "#";
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-slate-800 text-textPrimary font-semibold shadow-sm"
                                    : "text-textSecondary hover:bg-slate-800/50 hover:text-textPrimary"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-accent" : "text-textSecondary/70")} />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-borderDark">
                <button className="flex items-center gap-3 w-full px-3 py-2 text-textSecondary hover:bg-slate-800 hover:text-textPrimary rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings</span>
                </button>
                <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-borderDark">
                    <p className="text-[10px] text-textSecondary/60 font-bold uppercase tracking-widest mb-1">Thesis Active</p>
                    <p className="text-xs text-textPrimary font-medium leading-relaxed">Early-stage AI, Infra & Enterprise SaaS</p>
                </div>
            </div>
        </aside>
    );
}

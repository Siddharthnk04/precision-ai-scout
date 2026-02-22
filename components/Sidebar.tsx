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
    { name: "Signal Pulse", href: "#", icon: Activity, disabled: true },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-brand-gray-200 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-brand-gray-200 flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                    <Activity className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight text-brand-gray-900">Precision AI</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href) && item.href !== "#";
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-brand-gray-100 text-brand-gray-900 font-medium"
                                    : "text-brand-gray-500 hover:bg-brand-gray-50 hover:text-brand-gray-900",
                                item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-brand-blue" : "text-brand-gray-400")} />
                            {item.name}
                            {item.disabled && (
                                <span className="ml-auto text-[10px] uppercase font-bold tracking-widest bg-brand-gray-100 px-1.5 py-0.5 rounded text-brand-gray-400">Beta</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-brand-gray-200">
                <button className="flex items-center gap-3 w-full px-3 py-2 text-brand-gray-500 hover:bg-brand-gray-50 hover:text-brand-gray-900 rounded-md transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings</span>
                </button>
                <div className="mt-4 p-3 bg-brand-gray-50 rounded-lg border border-brand-gray-200">
                    <p className="text-xs text-brand-gray-500 font-medium uppercase tracking-wider mb-1">Thesis Active</p>
                    <p className="text-sm text-brand-gray-900 font-medium leading-snug">Enterprise AI & Decentralized Infra</p>
                </div>
            </div>
        </aside>
    );
}

"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchBarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSearch = searchParams.get("search") || searchParams.get("query") || "";

    const [searchValue, setSearchValue] = useState(currentSearch);

    // Keep internal state in sync with URL changes (back button, list navigation, etc.)
    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);

    // Handle search execution
    const executeSearch = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set("search", value.trim());
            // Support legacy query systems if they exist
            params.delete("query");
        } else {
            params.delete("search");
            params.delete("query");
        }
        router.push(`/companies?${params.toString()}`);
    }, [searchParams, router]);

    // Debounced search effect
    useEffect(() => {
        if (searchValue === currentSearch) return;

        const timer = setTimeout(() => {
            executeSearch(searchValue);
        }, 400); // Slightly longer debounce for stability

        return () => clearTimeout(timer);
    }, [searchValue, currentSearch, executeSearch]);

    const handleClear = () => {
        setSearchValue("");
        executeSearch("");
    };

    return (
        <div className="relative max-w-xl group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-textSecondary transition-colors group-focus-within:text-accent" />
            </div>
            <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        executeSearch(searchValue);
                    }
                }}
                placeholder="Search startups, tech, or signals..."
                className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-borderDark rounded-xl text-sm placeholder:text-textSecondary/40 text-textPrimary focus:outline-hidden focus:ring-2 focus:ring-accent/20 focus:border-accent/40 focus:bg-slate-800 transition-all duration-300"
            />
            {searchValue && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-textPrimary transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

export default function SearchBar() {
    return (
        <Suspense fallback={
            <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-textSecondary/20" />
                </div>
                <div className="block w-full h-10 bg-slate-800 border border-borderDark rounded-xl animate-pulse" />
            </div>
        }>
            <SearchBarContent />
        </Suspense>
    );
}

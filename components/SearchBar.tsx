"use client";

import { useState, useEffect, Suspense } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function SearchBarContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

    // Update internal state when URL change (e.g. navigation or clearing filters)
    useEffect(() => {
        setSearchValue(searchParams.get("search") || "");
    }, [searchParams]);

    // Handle debounced search update
    useEffect(() => {
        if (searchValue === (searchParams.get("search") || "")) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (searchValue) {
                params.set("search", searchValue);
            } else {
                params.delete("search");
            }
            router.push(`/companies?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, searchParams, router]);

    return (
        <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-brand-gray-400" />
            </div>
            <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search for companies, sectors, or signals..."
                className="block w-full pl-10 pr-4 py-2 bg-white border border-brand-gray-200 rounded-lg text-sm placeholder-brand-gray-400 focus:outline-hidden focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
        </div>
    );
}

export default function SearchBar() {
    return (
        <Suspense fallback={
            <div className="relative max-w-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-brand-gray-400" />
                </div>
                <div className="block w-full h-9 bg-brand-gray-50 border border-brand-gray-200 rounded-lg anim-pulse" />
            </div>
        }>
            <SearchBarContent />
        </Suspense>
    );
}

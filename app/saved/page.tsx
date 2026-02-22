"use client";

import { useState, useEffect } from "react";
import { SavedSearch } from "@/lib/types";
import { storage } from "@/lib/storage";
import {
    Bookmark,
    Search,
    Trash2,
    Play,
    Filter,
    Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SavedSearchesPage() {
    const [searches, setSearches] = useState<SavedSearch[]>([]);
    const router = useRouter();

    useEffect(() => {
        const stored = storage.getSavedSearches();
        if (stored.length === 0) {
            // Seed a default search
            const defaultSearch: SavedSearch = {
                id: "save-1",
                name: "Series A AI - San Francisco",
                filters: {
                    sector: "AI/ML",
                    stage: "Series A",
                    geography: "San Francisco"
                },
                createdAt: new Date().toISOString()
            };
            storage.saveSearch(defaultSearch);
            setSearches([defaultSearch]);
        } else {
            setSearches(stored);
        }
    }, []);

    const handleDelete = (id: string) => {
        storage.deleteSearch(id);
        setSearches(searches.filter(s => s.id !== id));
    };

    const handleRunSearch = (search: SavedSearch) => {
        const queryParams = new URLSearchParams();
        if (search.filters.sector) queryParams.set("sector", search.filters.sector);
        if (search.filters.stage) queryParams.set("stage", search.filters.stage);
        if (search.filters.geography) queryParams.set("geography", search.filters.geography);
        if (search.filters.query) queryParams.set("search", search.filters.query);

        router.push(`/companies?${queryParams.toString()}`);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary">Saved Searches</h1>
                    <p className="text-textSecondary mt-1">Quickly revisit filtered views matching your investment criteria.</p>
                </div>
            </div>

            <div className="space-y-4">
                {searches.map(search => (
                    <div key={search.id} className="card group hover:border-primary/30 transition-all">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-borderDark group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                                    <Bookmark className="w-5 h-5 text-textSecondary group-hover:text-accent transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-textPrimary group-hover:text-accent transition-colors">{search.name}</h3>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-textSecondary/60 font-bold uppercase tracking-widest">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Saved {new Date(search.createdAt).toLocaleDateString()}
                                        </div>
                                        {Object.entries(search.filters).map(([key, value]) => value && (
                                            <div key={key} className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase tracking-widest">
                                                <Filter className="w-3.5 h-3.5" />
                                                {key === 'query' ? 'Search' : key}: {value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleRunSearch(search)}
                                    className="btn btn-primary flex gap-2 text-[10px] font-bold uppercase tracking-widest py-2 px-5 shadow-lg shadow-primary/20"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" /> Run Search
                                </button>
                                <button
                                    onClick={() => handleDelete(search.id)}
                                    className="btn btn-secondary p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {searches.length === 0 && (
                    <div className="card p-16 text-center bg-slate-800/20 border-dashed border-2 border-borderDark/60">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-borderDark shadow-inner">
                            <Search className="w-8 h-8 text-textSecondary/30" />
                        </div>
                        <h3 className="font-bold text-lg text-textPrimary">No saved searches</h3>
                        <p className="text-sm text-textSecondary mt-2 max-w-sm mx-auto">
                            Save your current discovery filters as shortcuts to revisit them with a single click.
                        </p>
                        <Link href="/companies" className="btn btn-primary mt-8 px-8">
                            Go to Discovery
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

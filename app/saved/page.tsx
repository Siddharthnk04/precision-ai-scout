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

        router.push(`/companies?${queryParams.toString()}`);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-gray-900">Saved Searches</h1>
                    <p className="text-brand-gray-500 mt-1">Quickly revisit filtered views matching your investment criteria.</p>
                </div>
            </div>

            <div className="space-y-4">
                {searches.map(search => (
                    <div key={search.id} className="card group hover:border-brand-blue/30 transition-all">
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-brand-gray-50 flex items-center justify-center border border-brand-gray-200 group-hover:bg-brand-blue/5 group-hover:border-brand-blue/20 transition-colors">
                                    <Bookmark className="w-5 h-5 text-brand-gray-400 group-hover:text-brand-blue transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-brand-gray-900">{search.name}</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <div className="flex items-center gap-1.5 text-xs text-brand-gray-500 font-medium">
                                            <Calendar className="w-3 h-3" />
                                            Saved {new Date(search.createdAt).toLocaleDateString()}
                                        </div>
                                        {Object.entries(search.filters).map(([key, value]) => value && (
                                            <div key={key} className="flex items-center gap-1.5 text-xs text-brand-blue font-bold uppercase tracking-wider">
                                                <Filter className="w-3 h-3" />
                                                {key}: {value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleRunSearch(search)}
                                    className="btn btn-primary flex gap-2 text-xs py-2 px-4 shadow-sm"
                                >
                                    <Play className="w-3.5 h-3.5 fill-current" /> Run Search
                                </button>
                                <button
                                    onClick={() => handleDelete(search.id)}
                                    className="btn btn-secondary p-2 group-hover:border-red-100 group-hover:text-red-500 transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {searches.length === 0 && (
                    <div className="card p-12 text-center bg-brand-gray-50/50 border-dashed border-2">
                        <Search className="w-8 h-8 text-brand-gray-300 mx-auto mb-4" />
                        <h3 className="font-semibold text-brand-gray-900">No saved searches</h3>
                        <p className="text-sm text-brand-gray-500 mt-2">
                            Save your current discovery filters to quickly access them later.
                        </p>
                        <Link href="/companies" className="btn btn-secondary mt-6">
                            Go to Discovery
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

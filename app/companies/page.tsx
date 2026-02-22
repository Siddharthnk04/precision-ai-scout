"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { storage } from "@/lib/storage";
import { Company, SavedSearch } from "@/lib/types";
import FilterPanel from "@/components/FilterPanel";
import CompaniesTable from "@/components/CompaniesTable";
import { Plus, Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function CompaniesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Derive filters from searchParams (Source of Truth)
    const filters = useMemo(() => ({
        sector: searchParams.get("sector") || "",
        stage: searchParams.get("stage") || "",
        geography: searchParams.get("geography") || "",
        search: searchParams.get("search") || "",
        sort: searchParams.get("sort") || "recent",
    }), [searchParams]);

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`/companies?${params.toString()}`);
    };

    const handleSortChange = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (sort && sort !== 'recent') {
            params.set("sort", sort);
        } else {
            params.delete("sort");
        }
        router.push(`/companies?${params.toString()}`);
    };

    const handleSaveSearch = () => {
        const nameParts = [];
        if (filters.sector) nameParts.push(filters.sector);
        if (filters.stage) nameParts.push(filters.stage);
        if (filters.geography) nameParts.push(filters.geography);
        if (filters.search) nameParts.push(`"${filters.search}"`);

        const name = nameParts.length > 0 ? nameParts.join(" | ") : "Universal Search";

        // Map filters for storage (using old field name 'query' if storage expected it, but let's keep it consistent if possible)
        // However, existing storage logic might rely on the 'query' field in SavedSearch.
        // Let's check savedSearch type.
        const newSearch: SavedSearch = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            filters: {
                sector: filters.sector,
                stage: filters.stage,
                geography: filters.geography,
                query: filters.search // Keep mapping to 'query' for storage compatibility if needed, or update storage types.
                // Requirement says "Refactor search to use a single query param: search".
            },
            createdAt: new Date().toISOString()
        };

        storage.saveSearch(newSearch);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const sortedAndFilteredCompanies = useMemo(() => {
        // 1. Filter
        let results = MOCK_COMPANIES.filter((company: Company) => {
            const matchSector = !filters.sector || company.sector === filters.sector;
            const matchStage = !filters.stage || company.stage === filters.stage;
            const matchGeography = !filters.geography ||
                company.geography.toLowerCase().includes(filters.geography.toLowerCase());

            // Global search logic (checks name, website, sector, and tags)
            const searchVal = filters.search.toLowerCase();
            const matchSearch = !searchVal ||
                company.name.toLowerCase().includes(searchVal) ||
                company.website.toLowerCase().includes(searchVal) ||
                company.sector.toLowerCase().includes(searchVal) ||
                (company.tags && company.tags.some(tag => tag.toLowerCase().includes(searchVal)));

            return matchSector && matchStage && matchGeography && matchSearch;
        });

        // 2. Sort
        results = [...results].sort((a, b) => {
            switch (filters.sort) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "stage-asc": {
                    const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Series C+"];
                    return stages.indexOf(a.stage) - stages.indexOf(b.stage);
                }
                case "stage-desc": {
                    const stages = ["Pre-seed", "Seed", "Series A", "Series B", "Series C", "Series C+"];
                    return stages.indexOf(b.stage) - stages.indexOf(a.stage);
                }
                default:
                    return 0; // "Recently Added" - matches mock data order
            }
        });

        return results;
    }, [filters]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-gray-900">Company Discovery</h1>
                    <p className="text-brand-gray-500 mt-1">Discover early-stage startups matching your investment thesis.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSaveSearch}
                        className={cn(
                            "btn btn-secondary flex gap-2 transition-all",
                            saveSuccess && "bg-emerald-50 text-emerald-600 border-emerald-200"
                        )}
                    >
                        {saveSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {saveSuccess ? "Saved!" : "Save Search"}
                    </button>
                    <button className="btn btn-primary">
                        Export Results
                    </button>
                </div>
            </div>

            <div className="bg-white px-6 rounded-lg border border-brand-gray-200">
                <FilterPanel onFilterChange={handleFilterChange} />
            </div>

            <div className="flex items-center justify-between py-2">
                <span className="text-sm text-brand-gray-500 font-medium">
                    Showing <span className="text-brand-gray-900">{sortedAndFilteredCompanies.length}</span> companies
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-gray-500">Sort by:</span>
                    <select
                        value={filters.sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-transparent text-sm font-medium text-brand-gray-900 focus:outline-hidden cursor-pointer hover:text-brand-blue transition-colors"
                    >
                        <option value="recent">Recently Added</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="stage-asc">Stage (Early → Late)</option>
                        <option value="stage-desc">Stage (Late → Early)</option>
                    </select>
                </div>
            </div>

            <CompaniesTable companies={sortedAndFilteredCompanies} />
        </div>
    );
}

export default function CompaniesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-brand-gray-500 font-medium">Loading Discovery...</div>}>
            <CompaniesPageContent />
        </Suspense>
    );
}

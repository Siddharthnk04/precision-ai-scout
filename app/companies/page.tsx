"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { storage } from "@/lib/storage";
import { Company, SavedSearch } from "@/lib/types";
import FilterPanel from "@/components/FilterPanel";
import CompaniesTable from "@/components/CompaniesTable";
import { Plus, Check, Download, FileJson, FileSpreadsheet, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { track } from "@/lib/analytics";
import { exportUtils } from "@/lib/export";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function CompaniesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [cache, setCache] = useState(storage.getEnrichmentCache());
    const [currentPage, setCurrentPage] = useState(1);
    const [exportOpen, setExportOpen] = useState(false);
    const pageSize = 10;

    // Listen for enrichment updates for reactive sorting
    useEffect(() => {
        const handleUpdate = () => setCache(storage.getEnrichmentCache());
        window.addEventListener('enrichment-updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);
        return () => {
            window.removeEventListener('enrichment-updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    // Derive filters from searchParams (Source of Truth)
    const filters = useMemo(() => ({
        sector: searchParams.get("sector") || "",
        stage: searchParams.get("stage") || "",
        geography: searchParams.get("geography") || "",
        search: searchParams.get("search") || searchParams.get("query") || "",
        sort: searchParams.get("sort") || "recent",
    }), [searchParams]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleFilterChange = (newFilters: Partial<typeof filters>) => {
        track("search");
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

        const newSearch: SavedSearch = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            filters: {
                sector: filters.sector,
                stage: filters.stage,
                geography: filters.geography,
                query: filters.search
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
                case "enriched": {
                    const cacheA = cache[a.id];
                    const cacheB = cache[b.id];
                    const timeA = cacheA?.enrichedAt ? new Date(cacheA.enrichedAt).getTime() : 0;
                    const timeB = cacheB?.enrichedAt ? new Date(cacheB.enrichedAt).getTime() : 0;
                    return timeB - timeA;
                }
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
    }, [filters, cache]); // Added cache as dependency for reactivity on enrichment

    // Derive paginated companies for specific export + view
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedCompanies = useMemo(() =>
        sortedAndFilteredCompanies.slice(startIndex, startIndex + pageSize),
        [sortedAndFilteredCompanies, startIndex]
    );

    const handleExport = useCallback((type: 'csv' | 'json') => {
        const suffix = `discovery-pg${currentPage}`;
        if (type === 'csv') exportUtils.toCSV(paginatedCompanies, suffix);
        else exportUtils.toJSON(paginatedCompanies, suffix);
        setExportOpen(false);
    }, [paginatedCompanies, currentPage]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary">Company Discovery</h1>
                    <p className="text-textSecondary mt-1">Discover early-stage startups matching your investment thesis.</p>
                </div>
                <div className="flex gap-3 relative">
                    <button
                        onClick={handleSaveSearch}
                        className={cn(
                            "btn btn-secondary flex gap-2 transition-all",
                            saveSuccess && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        )}
                    >
                        {saveSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {saveSuccess ? "Saved!" : "Save Search"}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setExportOpen(!exportOpen)}
                            className="btn btn-primary shadow-lg shadow-primary/25 flex gap-2"
                        >
                            <Download className="w-4 h-4" /> Export <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", exportOpen && "rotate-180")} />
                        </button>

                        {exportOpen && (
                            <div className="absolute right-0 mt-2 w-48 card border-borderDark/60 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={() => handleExport('csv')}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-textSecondary hover:text-textPrimary hover:bg-slate-800 rounded-lg transition-all uppercase tracking-widest"
                                    >
                                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export current page (CSV)
                                    </button>
                                    <button
                                        onClick={() => handleExport('json')}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-textSecondary hover:text-textPrimary hover:bg-slate-800 rounded-lg transition-all uppercase tracking-widest"
                                    >
                                        <FileJson className="w-4 h-4 text-blue-400" /> Export current page (JSON)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card px-6">
                <FilterPanel onFilterChange={handleFilterChange} />
            </div>

            <div className="flex items-center justify-between py-2">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">
                    Showing <span className="text-textPrimary">{sortedAndFilteredCompanies.length}</span> companies
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-textSecondary">Sort by:</span>
                    <select
                        value={filters.sort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-textPrimary focus:outline-hidden cursor-pointer hover:text-accent transition-colors"
                    >
                        <option value="recent" className="bg-slate-900">Recently Added</option>
                        <option value="enriched" className="bg-slate-900">Recently Enriched</option>
                        <option value="name-asc" className="bg-slate-900">Name (A-Z)</option>
                        <option value="name-desc" className="bg-slate-900">Name (Z-A)</option>
                        <option value="stage-asc" className="bg-slate-900">Stage (Early → Late)</option>
                        <option value="stage-desc" className="bg-slate-900">Stage (Late → Early)</option>
                    </select>
                </div>
            </div>

            <CompaniesTable
                companies={sortedAndFilteredCompanies}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                paginatedCompanies={paginatedCompanies}
            />
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

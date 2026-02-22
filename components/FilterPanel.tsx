"use client";

import { Sector, Stage } from "@/lib/types";

interface FilterPanelProps {
    onFilterChange: (filters: any) => void;
}

const SECTORS: Sector[] = ['Enterprise SaaS', 'Fintech', 'Healthtech', 'AI/ML', 'Consumer', 'Infrastructure', 'Other'];
const STAGES: Stage[] = ['Seed', 'Series A', 'Series B', 'Series C+'];

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
    return (
        <div className="flex flex-wrap gap-4 items-center py-6">
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest pl-1">Sector</label>
                <select
                    onChange={(e) => onFilterChange({ sector: e.target.value })}
                    className="bg-slate-800 border border-borderDark rounded-lg py-1.5 pl-3 pr-8 text-sm text-textPrimary focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-accent/40 transition-all cursor-pointer"
                >
                    <option value="">All Sectors</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest pl-1">Stage</label>
                <select
                    onChange={(e) => onFilterChange({ stage: e.target.value })}
                    className="bg-slate-800 border border-borderDark rounded-lg py-1.5 pl-3 pr-8 text-sm text-textPrimary focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-accent/40 transition-all cursor-pointer"
                >
                    <option value="">All Stages</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase tracking-widest pl-1">Geography</label>
                <input
                    type="text"
                    placeholder="e.g. SF, London..."
                    onChange={(e) => onFilterChange({ geography: e.target.value })}
                    className="bg-slate-800 border border-borderDark rounded-lg py-1.5 px-3 text-sm text-textPrimary placeholder:text-textSecondary/40 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-accent/40 transition-all max-w-[150px]"
                />
            </div>

            <div className="ml-auto">
                <button
                    onClick={() => onFilterChange({ sector: '', stage: '', geography: '', search: '' })}
                    className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors tracking-wide uppercase"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
}

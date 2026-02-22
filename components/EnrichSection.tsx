"use client";

import { useState, useEffect } from "react";
import { Company, EnrichmentData } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Sparkles, Loader2, Globe, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EnrichSectionProps {
    company: Company;
}

export default function EnrichSection({ company }: EnrichSectionProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const cached = storage.getCachedEnrichment(company.id);
        if (cached) {
            setEnrichment(cached);
        }
    }, [company.id]);

    const handleEnrich = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/enrich", {
                method: "POST",
                body: JSON.stringify({ url: company.website }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error("Failed to fetch enrichment data");

            const data = await res.json();
            setEnrichment(data);
            storage.cacheEnrichment(company.id, data);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!enrichment && !loading) {
        return (
            <div className="card p-8 text-center bg-brand-gray-50/50 border-dashed border-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-gray-200">
                    <Sparkles className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="font-semibold text-brand-gray-900">Live Web Enrichment</h3>
                <p className="text-sm text-brand-gray-500 mt-2 max-w-sm mx-auto">
                    Scan {company.name}'s website to discover signals, hiring patterns, and deeper product insights.
                </p>
                <button
                    onClick={handleEnrich}
                    className="btn btn-primary mt-6 min-w-[140px]"
                >
                    Enrich Profile
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-brand-gray-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                        Intelligence Report
                        <span className="badge badge-blue py-0.5 px-2">AI Powered</span>
                    </h3>
                    {enrichment && !loading && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Cached
                        </span>
                    )}
                </div>
                <button
                    onClick={handleEnrich}
                    disabled={loading}
                    className="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {loading ? "Refreshing..." : "Refresh Signals"}
                </button>
            </div>

            <div className={cn("card p-6 transition-all", loading && "opacity-50 pointer-events-none")}>
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-brand-gray-100 rounded w-3/4"></div>
                        <div className="space-y-2">
                            <div className="h-3 bg-brand-gray-100 rounded"></div>
                            <div className="h-3 bg-brand-gray-100 rounded"></div>
                            <div className="h-3 bg-brand-gray-100 rounded w-5/6"></div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100 text-sm text-red-600">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-brand-gray-700 leading-relaxed italic">"{enrichment?.summary}"</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-brand-gray-500 uppercase tracking-widest border-b border-brand-gray-100 pb-2">Core Product</h4>
                                <ul className="space-y-2">
                                    {enrichment?.whatTheyDo.map((item, i) => (
                                        <li key={i} className="text-sm text-brand-gray-800 flex items-start gap-2">
                                            <span className="text-brand-gray-300 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-brand-gray-500 uppercase tracking-widest border-b border-brand-gray-100 pb-2">Intelligence Timeline</h4>
                                <div className="relative pl-3 ml-1 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-brand-gray-100 before:content-['']">
                                    {enrichment?.signals.map((signal, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[15.5px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-brand-blue ring-4 ring-brand-gray-50/50" />
                                            <div className="p-3 bg-brand-gray-50 rounded-lg border border-brand-gray-100 shadow-xs hover:border-brand-blue/30 transition-colors">
                                                <span className="text-sm font-semibold text-brand-gray-900 leading-tight">{signal}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-brand-gray-100 flex items-center justify-between text-[11px] text-brand-gray-400">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    <a href={company.website} target="_blank" className="hover:text-brand-blue underline">{company.website.replace('https://', '')}</a>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{enrichment?.sources[0]?.timestamp ? new Date(enrichment.sources[0].timestamp).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {enrichment?.keywords.map(k => (
                                    <span key={k} className="px-1.5 py-0.5 bg-brand-gray-100 rounded">#{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

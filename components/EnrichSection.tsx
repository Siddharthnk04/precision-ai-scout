"use client";

import { useState, useEffect } from "react";
import { Company, EnrichmentData } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Sparkles, Loader2, Globe, Clock, CheckCircle2, AlertCircle, TrendingUp, Info } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { track } from "@/lib/analytics";

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
    const [isCached, setIsCached] = useState(false);

    useEffect(() => {
        const cached = storage.getCachedEnrichment(company.id);
        if (cached) {
            setEnrichment(cached);
            setIsCached(true);
        }
    }, [company.id]);

    const handleEnrich = async () => {
        setLoading(true);
        setError(null);
        track("enrich_clicked");
        try {
            const res = await fetch("/api/enrich", {
                method: "POST",
                body: JSON.stringify({
                    url: company.website,
                    companyId: company.id
                }),
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to fetch enrichment data");
            }

            const data = await res.json();
            setEnrichment(data);
            setIsCached(false);
            storage.cacheEnrichment(company.id, data);

            // Dispatch event for real-time sync across components
            window.dispatchEvent(new Event('enrichment-updated'));

            track("enrich_success");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        if (score >= 60) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        return "bg-slate-700 text-slate-400 border-borderDark";
    };

    const isOutdated = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
    };

    if (!enrichment && !loading) {
        return (
            <div className="card p-8 text-center bg-slate-800/50 border-dashed border-2 border-borderDark/60">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-borderDark">
                    <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-textPrimary">Live Web Enrichment</h3>
                <p className="text-sm text-textSecondary mt-2 max-w-sm mx-auto">
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

    const timestamp = enrichment?.enrichedAt;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-textPrimary uppercase text-[10px] tracking-widest flex items-center gap-2">
                        Intelligence Report
                        <span className="badge bg-accent/10 text-accent border border-accent/20 py-0.5 px-2">AI Powered</span>
                    </h3>
                    {enrichment && !loading && (
                        <span className={cn(
                            "badge text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border",
                            isCached ? "bg-slate-800 text-textSecondary border-borderDark" : "bg-primary/10 text-primary border-primary/20"
                        )}>
                            {isCached ? "Cached" : "Live"}
                        </span>
                    )}
                </div>
                <button
                    onClick={handleEnrich}
                    disabled={loading}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {loading ? "Refreshing..." : "Refresh Signals"}
                </button>
            </div>

            {timestamp && isOutdated(timestamp) && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Data may be outdated — re-run enrichment to get the latest intelligence.</span>
                </div>
            )}

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
                    <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-sm text-red-400">
                        {error}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Thesis Score Section */}
                        {enrichment?.thesisScore !== undefined && (
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-accent/20 space-y-3 shadow-inner">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-accent/60" />
                                        <span className="text-xs font-bold text-textSecondary uppercase tracking-widest">Thesis Match Score</span>
                                    </div>
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm",
                                        getScoreColor(enrichment.thesisScore)
                                    )}>
                                        {enrichment.thesisScore}%
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Info className="w-3.5 h-3.5 text-accent/40 mt-0.5 shrink-0" />
                                    <p className="text-sm text-textSecondary leading-relaxed font-medium">
                                        {enrichment.thesisRationale || "No rationale provided."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-textPrimary/90 leading-relaxed italic border-l-2 border-slate-700 pl-4">"{enrichment?.summary}"</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest border-b border-borderDark pb-2">Core Product</h4>
                                <ul className="space-y-3">
                                    {enrichment?.bullets.map((item, i) => (
                                        <li key={i} className="text-sm text-textSecondary/90 flex items-start gap-3 group">
                                            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0 transition-transform group-hover:scale-150 group-hover:bg-accent" />
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest border-b border-borderDark pb-2">Intelligence Timeline</h4>
                                <div className="relative pl-3 ml-1 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-800 before:content-['']">
                                    {enrichment?.signals.map((signal, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[15.5px] top-1.5 w-3 h-3 rounded-full border-2 border-cardDark bg-accent shadow-[0_0_8px_rgba(6,182,212,0.3)]" />
                                            <div className="p-3 bg-slate-800/40 rounded-lg border border-borderDark shadow-sm hover:border-accent/30 transition-all duration-300">
                                                <span className="text-sm font-semibold text-textPrimary leading-tight">{signal.title}</span>
                                                <p className="text-[10px] text-textSecondary mt-1 leading-tight">{signal.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-borderDark flex items-center justify-between text-[11px] text-textSecondary/50">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    <a href={company.website} target="_blank" className="hover:text-accent underline decoration-accent/20 underline-offset-2">{company.website.replace('https://', '')}</a>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {enrichment?.keywords.map(k => (
                                    <span key={k} className="px-1.5 py-0.5 bg-slate-800 text-textSecondary/70 rounded border border-borderDark text-[9px] font-bold uppercase tracking-wider">#{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useMemo, useEffect, useState } from "react";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { storage } from "@/lib/storage";
import { EnrichmentData } from "@/lib/types";
import { track } from "@/lib/analytics";
import { Activity, Zap, AlertCircle, TrendingUp, ChevronRight, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function SignalPulsePage() {
    useEffect(() => {
        track("signal_pulse_viewed");
    }, []);

    const [cache, setCache] = useState<Record<string, EnrichmentData>>({});

    useEffect(() => {
        // Initial load
        setCache(storage.getEnrichmentCache());

        // Listen for storage changes (cross-tab)
        const handleStorage = () => {
            setCache(storage.getEnrichmentCache());
        };
        window.addEventListener('storage', handleStorage);

        // Custom event for same-tab updates
        window.addEventListener('enrichment-updated', handleStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('enrichment-updated', handleStorage);
        };
    }, []);

    const enrichedResults = useMemo(() => {
        const companies = MOCK_COMPANIES.map(company => ({
            ...company,
            enrichment: cache[company.id] || null
        })).filter(c => c.enrichment !== null);

        return companies;
    }, [cache]);

    // A. High Thesis Alignment Section
    const highAlignment = useMemo(() => {
        return enrichedResults
            .filter(c => (c.enrichment?.thesisScore || 0) >= 80)
            .sort((a, b) => (b.enrichment?.thesisScore || 0) - (a.enrichment?.thesisScore || 0));
    }, [enrichedResults]);

    // B. Risk Alerts (Stale > 7 days)
    const riskAlerts = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return enrichedResults.filter(c => {
            const lastUpdated = c.enrichment?.enrichedAt;
            return lastUpdated && new Date(lastUpdated) < sevenDaysAgo;
        });
    }, [enrichedResults]);

    // C. Chronological Feed
    const activityFeed = useMemo(() => {
        return [...enrichedResults].sort((a, b) => {
            const timeA = new Date(a.enrichment?.enrichedAt || 0).getTime();
            const timeB = new Date(b.enrichment?.enrichedAt || 0).getTime();
            return timeB - timeA;
        });
    }, [enrichedResults]);

    // D. Trending Signals
    const trendingSignals = useMemo(() => {
        const allSignals = enrichedResults.flatMap(c =>
            (c.enrichment?.signals || []).map((s: any) => ({
                title: s.title,
                company: c.name,
                companyId: c.id,
                timestamp: s.timestamp || c.enrichment?.enrichedAt || "",
                url: c.website
            }))
        );

        return allSignals.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 10);
    }, [enrichedResults]);

    const getFreshness = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffHours < 24) return { label: "Live", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
        if (diffHours < 168) return { label: "Recent", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { label: "Stale", color: "text-red-400 bg-red-500/10 border-red-500/20" };
    };

    if (enrichedResults.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-borderDark shadow-2xl">
                    <Activity className="w-10 h-10 text-textSecondary opacity-20" />
                </div>
                <h2 className="text-2xl font-bold text-textPrimary">No Pulse Detected</h2>
                <p className="text-textSecondary mt-2 max-w-sm">
                    Enrich companies in the discovery pipeline to start generating intelligence signals.
                </p>
                <Link href="/companies" className="btn btn-primary mt-8 px-8">
                    Go to Discovery
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary tracking-tight flex items-center gap-3">
                        <Activity className="text-accent w-8 h-8" />
                        Signal Pulse
                    </h1>
                    <p className="text-textSecondary mt-2 leading-relaxed">
                        Cross-portfolio intelligence and thesis monitoring.
                    </p>
                </div>
            </div>

            {/* Top: High Alignment */}
            {highAlignment.length > 0 && (
                <section className="space-y-4">
                    <h3 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-accent" />
                        High Thesis Alignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {highAlignment.map(c => (
                            <Link
                                key={c.id}
                                href={`/companies/${c.id}`}
                                onClick={() => track("company_opened_from_pulse")}
                                className="card p-6 border-l-4 border-accent hover:bg-slate-800/50 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-textPrimary group-hover:text-accent transition-colors">{c.name}</h4>
                                    <span className="text-2xl font-black text-accent">{c.enrichment?.thesisScore}%</span>
                                </div>
                                <p className="text-sm text-textSecondary line-clamp-2 italic mb-4 leading-relaxed">
                                    "{c.enrichment?.thesisRationale}"
                                </p>
                                <div className="flex items-center text-[10px] font-bold text-textSecondary/60 uppercase tracking-wider">
                                    View Profile <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Middle: Alerts */}
            {riskAlerts.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0 border border-red-500/20">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-200">{riskAlerts.length} companies require re-enrichment</h4>
                        <p className="text-sm text-red-400/80 mt-1">
                            Intelligence data is older than 7 days and may be stale.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main: Chronological Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-textSecondary" />
                        Intelligence Activity
                    </h3>
                    <div className="space-y-4">
                        {activityFeed.map((c, i) => {
                            const freshness = getFreshness(c.enrichment?.enrichedAt || "");
                            return (
                                <div key={c.id} className="card p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Link
                                                href={`/companies/${c.id}`}
                                                className="text-lg font-bold text-textPrimary hover:text-accent transition-colors"
                                            >
                                                {c.name}
                                            </Link>
                                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest", freshness.color)}>
                                                {freshness.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-textSecondary mb-4">
                                            {c.enrichment?.summary}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {(c.enrichment?.keywords || []).slice(0, 3).map((k: string) => (
                                                <span key={k} className="badge badge-neutral text-[10px]">{k}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="md:w-32 flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-borderDark pt-4 md:pt-0 md:pl-6">
                                        <span className="text-xs font-bold text-textSecondary/40 uppercase tracking-widest mb-1">Score</span>
                                        <span className="text-2xl font-black text-textPrimary">{c.enrichment?.thesisScore}</span>
                                        <span className="text-[10px] font-bold text-textSecondary/40 uppercase tracking-widest mt-2">
                                            {c.enrichment?.signals.length} Signals
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Trending Signals */}
                <aside className="space-y-6">
                    <h3 className="text-[10px] font-bold text-textSecondary uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-textSecondary" />
                        Trending Signals
                    </h3>
                    <div className="space-y-3">
                        {trendingSignals.map((signal, i) => (
                            <div key={i} className="card p-4 group hover:border-accent/30 transition-all">
                                <p className="text-sm font-semibold text-textPrimary leading-tight mb-2 group-hover:text-accent transition-colors">
                                    {signal.title}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-widest">
                                        {signal.company}
                                    </span>
                                    <a
                                        href={signal.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => track("signal_clicked")}
                                        className="text-textSecondary/40 hover:text-accent transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}

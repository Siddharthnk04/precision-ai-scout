"use client";

import { useMemo, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { storage } from "@/lib/storage";
import EnrichSection from "@/components/EnrichSection";
import NotesPanel from "@/components/NotesPanel";
import AddToListModal from "@/components/AddToListModal";
import {
    BarChart3,
    MapPin,
    Globe,
    Tag,
    ArrowLeft,
    Plus,
    Lightbulb,
    ChevronRight,
    BookmarkCheck
} from "lucide-react";

export default function CompanyProfilePage({ params }: { params: { id: string } }) {
    const id = params.id;
    const company = useMemo(() => MOCK_COMPANIES.find(c => c.id === id), [id]);
    const [enrichment, setEnrichment] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Refresh explainability when enrichment is updated
    useEffect(() => {
        const cached = storage.getCachedEnrichment(id);
        if (cached) setEnrichment(cached);
    }, [id]);

    if (!company) {
        notFound();
    }

    // explainability logic: why this matches thesis
    const explainabilityPoints = [
        `Strong alignment with ${company.sector} focus.`,
        `Optimal ${company.stage} entry point for current fund.`,
        ...(enrichment?.keywords?.slice(0, 2).map((k: string) => `Differentiated technology in ${k}.`) || []),
        `Geographic presence in ${company.geography} provides strategic access.`
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Link href="/companies" className="flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Discovery
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-secondary flex gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add to List
                    </button>
                    <button className="btn btn-ghost flex gap-2">
                        <BookmarkCheck className="w-4 h-4 text-accent" /> Save
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-textPrimary tracking-tight">{company.name}</h1>
                        <span className="badge badge-neutral px-3 py-1 text-sm">{company.stage}</span>
                    </div>
                    <p className="text-lg text-textSecondary max-w-2xl leading-relaxed">
                        {company.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-5 pt-2">
                        <div className="flex items-center gap-2 text-sm text-textSecondary font-medium">
                            <BarChart3 className="w-4 h-4 text-textSecondary/50" />
                            {company.sector}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-textSecondary font-medium">
                            <MapPin className="w-4 h-4 text-textSecondary/50" />
                            {company.geography}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-textSecondary font-medium">
                            <Globe className="w-4 h-4 text-textSecondary/50" />
                            <a href={company.website} target="_blank" className="hover:text-accent underline decoration-accent/30 underline-offset-4">
                                {company.website.replace('https://', '')}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 max-w-xs md:justify-end">
                    {company.tags.map(tag => (
                        <span key={tag} className="badge badge-neutral text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Intelligence & Enrichment */}
                <div className="lg:col-span-2 space-y-8">
                    <EnrichSection company={company} />

                    {/* Explainability Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-textPrimary uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-accent shadow-[0_0_10px_rgba(6,182,212,0.4)]" />
                            Why This Matches Thesis
                        </h3>
                        <div className="card p-6 bg-slate-800/30 border-l-4 border-accent/40 shadow-inner">
                            <ul className="space-y-4">
                                {explainabilityPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <ChevronRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                        <span className="text-sm font-semibold text-textSecondary">{point}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 pt-4 border-t border-borderDark flex items-center gap-2">
                                <span className="text-[10px] text-textSecondary/60 font-bold uppercase tracking-widest">Signal Confidence</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`w-3.5 h-1.5 rounded-sm shadow-sm transition-colors ${i <= 4 ? 'bg-accent/80' : 'bg-slate-700'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analysis & Actions */}
                <div className="space-y-8">
                    <NotesPanel companyId={company.id} />
                </div>
            </div>

            <AddToListModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                companyId={company.id}
                companyName={company.name}
            />
        </div>
    );
}

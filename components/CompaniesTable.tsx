"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Company } from "@/lib/types";
import { ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";

interface CompaniesTableProps {
    companies: Company[];
    currentPage: number;
    onPageChange: (page: number) => void;
    paginatedCompanies: Company[];
}

export default function CompaniesTable({
    companies,
    currentPage,
    onPageChange,
    paginatedCompanies
}: CompaniesTableProps) {
    const router = useRouter();
    const pageSize = 10;
    const totalPages = Math.ceil(companies.length / pageSize);

    return (
        <div className="space-y-4">
            <div className="card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-borderDark">
                            <th className="px-6 py-4 text-[10px] font-bold text-textSecondary uppercase tracking-widest">Company</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-textSecondary uppercase tracking-widest">Sector</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-textSecondary uppercase tracking-widest">Stage</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-textSecondary uppercase tracking-widest">Geography</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCompanies.map((company) => (
                            <tr
                                key={company.id}
                                className="border-b border-borderDark last:border-0 hover:bg-slate-800/50 cursor-pointer group transition-colors"
                                onClick={() => router.push(`/companies/${company.id}`)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-textPrimary group-hover:text-accent transition-colors">
                                            {company.name}
                                        </span>
                                        <span className="text-xs text-textSecondary flex items-center gap-1 opacity-70">
                                            {company.website.replace('https://', '') || company.website}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="badge badge-neutral">{company.sector}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-textSecondary font-medium">{company.stage}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-textSecondary/80">{company.geography}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <ChevronRight className="inline-block w-4 h-4 text-textSecondary/40 group-hover:text-accent transition-colors" />
                                </td>
                            </tr>
                        ))}
                        {companies.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-brand-gray-500">
                                    No companies match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {companies.length > pageSize && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-textSecondary uppercase tracking-widest">
                        Page <span className="text-textPrimary">{currentPage}</span> of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="btn btn-secondary px-3 py-1.5 gap-2 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="btn btn-secondary px-3 py-1.5 gap-2 disabled:opacity-50"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
